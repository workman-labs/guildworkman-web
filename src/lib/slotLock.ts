/**
 * Client-side slot locking, to stop a visitor from double-booking the same
 * worker/date/time.
 *
 * WHY THIS IS CLIENT-SIDE ONLY (read before extending this file)
 * Double-booking is really a backend concern — the source of truth for "is
 * this worker already busy at 9:30am Thursday" has to live wherever
 * appointments are stored. Today `guildworkman-core` doesn't expose an
 * endpoint to list a *worker's* upcoming appointments — only
 * `viewAllAppointment`, which returns the logged-in *client's own*
 * bookings (see `viewAllAppointmentApi` in lib/api.ts). Without a
 * per-worker availability endpoint, the frontend has no way to ask "is
 * this slot already taken by someone else" before submitting.
 *
 * Until that endpoint exists, this module owns the piece that *is*
 * legitimately solvable on the frontend: stopping a visitor from
 * double-booking *themselves* — e.g. opening the same worker's page in two
 * tabs and paying for the same slot twice, or refreshing mid-checkout and
 * losing track of a slot they already committed to. It combines
 * `localStorage` (survives a refresh) with `BroadcastChannel` (near-
 * instant sync across tabs of the same browser) and a short TTL, so a lock
 * left behind by a crashed tab or an abandoned checkout releases itself
 * automatically instead of blocking that slot forever.
 *
 * ARCHITECTURAL NOTE for reviewers: this does NOT prevent two different
 * visitors (different browsers) from racing for the same slot — that
 * needs a backend change (a per-worker availability/hold endpoint) which
 * is out of scope for a Frontend-only issue. Tracking that as a follow-up
 * is recommended once this lands.
 */

const CHANNEL_NAME = "gw-slot-locks";
const STORAGE_PREFIX = "gw-slot-lock:";

/** How long a selected slot stays held before it's released automatically.
    Long enough to pick a service, fill in the job address, and pay. */
export const LOCK_TTL_MS = 5 * 60_000;

export interface SlotLock {
  key: string;
  holderId: string;
  expiresAt: number;
}

function storageKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

/** Builds the lock key for a given worker + date + time slot. */
export function slotKey(workerId: string, dateIso: string, time: string): string {
  return `${workerId}|${dateIso}|${time}`;
}

function readLock(key: string): SlotLock | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(key));
    if (!raw) return null;
    const lock = JSON.parse(raw) as SlotLock;
    if (!lock.expiresAt || lock.expiresAt <= Date.now()) {
      window.localStorage.removeItem(storageKey(key));
      return null;
    }
    return lock;
  } catch {
    // Corrupt entry (e.g. hand-edited storage) — treat as unlocked rather
    // than throwing during render.
    return null;
  }
}

function writeLock(key: string, lock: SlotLock | null): void {
  if (typeof window === "undefined") return;
  if (lock) window.localStorage.setItem(storageKey(key), JSON.stringify(lock));
  else window.localStorage.removeItem(storageKey(key));
}

function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return null;
  try {
    return new BroadcastChannel(CHANNEL_NAME);
  } catch {
    return null;
  }
}

/** Returns the current lock on `key`, or null if it's free / expired. */
export function getSlotLock(key: string): SlotLock | null {
  return readLock(key);
}

/** True if `key` is currently locked by someone other than `holderId`. */
export function isLockedByOther(key: string, holderId: string): boolean {
  const lock = readLock(key);
  return Boolean(lock && lock.holderId !== holderId);
}

/** Attempts to acquire (or renew) the lock on `key` for `holderId`.
    Returns false without changing anything if another holder already has
    an unexpired lock on it. */
export function acquireSlotLock(key: string, holderId: string, ttlMs = LOCK_TTL_MS): boolean {
  const existing = readLock(key);
  if (existing && existing.holderId !== holderId) return false;

  const lock: SlotLock = { key, holderId, expiresAt: Date.now() + ttlMs };
  writeLock(key, lock);
  const channel = getChannel();
  channel?.postMessage({ type: "lock", key });
  channel?.close();
  return true;
}

/** Releases `key`, but only if `holderId` is the one holding it — so a
    stale release firing from an old/reloaded tab can't steal a lock that a
    newer tab has since (legitimately) taken over. */
export function releaseSlotLock(key: string, holderId: string): void {
  const existing = readLock(key);
  if (!existing || existing.holderId !== holderId) return;
  writeLock(key, null);
  const channel = getChannel();
  channel?.postMessage({ type: "release", key });
  channel?.close();
}

/** Subscribes to lock changes coming from other tabs — both same-tick
    updates via `BroadcastChannel` and the native cross-document `storage`
    event (fires in *other* tabs, not the one that wrote the value, which
    is exactly the case `BroadcastChannel` covers for same-runtime
    listeners already active). Returns an unsubscribe function. */
export function subscribeToLockChanges(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const channel = getChannel();
  channel?.addEventListener("message", onChange);

  const onStorage = (e: StorageEvent) => {
    if (e.key?.startsWith(STORAGE_PREFIX)) onChange();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    channel?.removeEventListener("message", onChange);
    channel?.close();
    window.removeEventListener("storage", onStorage);
  };
}

/** A per-tab identity so a tab's own lock never reads as "locked by
    someone else" to itself. Call once per component/session, not per
    render. */
export function createHolderId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
