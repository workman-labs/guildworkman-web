import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  LOCK_TTL_MS,
  acquireSlotLock,
  getSlotLock,
  isLockedByOther,
  releaseSlotLock,
  slotKey,
  subscribeToLockChanges,
} from "../slotLock";
 
describe("slotKey", () => {
  it("combines worker, date, and time into a stable key", () => {
    expect(slotKey("gw-chidi", "2026-07-24", "09:00")).toBe("gw-chidi|2026-07-24|09:00");
  });
 
  it("produces different keys for different slots", () => {
    const a = slotKey("gw-chidi", "2026-07-24", "09:00");
    const b = slotKey("gw-chidi", "2026-07-24", "09:30");
    const c = slotKey("gw-chidi", "2026-07-25", "09:00");
    const d = slotKey("gw-ada", "2026-07-24", "09:00");
    expect(new Set([a, b, c, d]).size).toBe(4);
  });
});
 
describe("acquireSlotLock / releaseSlotLock / getSlotLock", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });
 
  it("acquires a free slot", () => {
    const key = slotKey("gw-chidi", "2026-07-24", "09:00");
    expect(acquireSlotLock(key, "tab-a")).toBe(true);
    expect(getSlotLock(key)?.holderId).toBe("tab-a");
  });
 
  it("lets the same holder re-acquire (renew) its own lock", () => {
    const key = slotKey("gw-chidi", "2026-07-24", "09:00");
    acquireSlotLock(key, "tab-a");
    expect(acquireSlotLock(key, "tab-a")).toBe(true);
  });
 
  it("refuses to hand a locked slot to a different holder", () => {
    const key = slotKey("gw-chidi", "2026-07-24", "09:00");
    acquireSlotLock(key, "tab-a");
    expect(acquireSlotLock(key, "tab-b")).toBe(false);
    // the original holder keeps the lock
    expect(getSlotLock(key)?.holderId).toBe("tab-a");
  });
 
  it("frees the slot once the original holder releases it", () => {
    const key = slotKey("gw-chidi", "2026-07-24", "09:00");
    acquireSlotLock(key, "tab-a");
    releaseSlotLock(key, "tab-a");
    expect(getSlotLock(key)).toBeNull();
    expect(acquireSlotLock(key, "tab-b")).toBe(true);
  });
 
  it("does not let a non-holder release someone else's lock", () => {
    const key = slotKey("gw-chidi", "2026-07-24", "09:00");
    acquireSlotLock(key, "tab-a");
    releaseSlotLock(key, "tab-b"); // wrong holder — should be a no-op
    expect(getSlotLock(key)?.holderId).toBe("tab-a");
  });
});
 
describe("isLockedByOther", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });
 
  it("is false for a free slot", () => {
    const key = slotKey("gw-chidi", "2026-07-24", "09:00");
    expect(isLockedByOther(key, "tab-a")).toBe(false);
  });
 
  it("is false for the slot's own holder", () => {
    const key = slotKey("gw-chidi", "2026-07-24", "09:00");
    acquireSlotLock(key, "tab-a");
    expect(isLockedByOther(key, "tab-a")).toBe(false);
  });
 
  it("is true when a different holder has the lock", () => {
    const key = slotKey("gw-chidi", "2026-07-24", "09:00");
    acquireSlotLock(key, "tab-a");
    expect(isLockedByOther(key, "tab-b")).toBe(true);
  });
});
 
describe("lock expiry (TTL)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.useFakeTimers();
  });
 
  afterEach(() => {
    vi.useRealTimers();
  });
 
  it("releases the lock on its own once the TTL has elapsed", () => {
    const key = slotKey("gw-chidi", "2026-07-24", "09:00");
    acquireSlotLock(key, "tab-a");
    expect(getSlotLock(key)).not.toBeNull();
 
    vi.advanceTimersByTime(LOCK_TTL_MS + 1);
 
    expect(getSlotLock(key)).toBeNull();
    // and since it's expired, a different holder can now take it
    expect(acquireSlotLock(key, "tab-b")).toBe(true);
  });
 
  it("does not expire early", () => {
    const key = slotKey("gw-chidi", "2026-07-24", "09:00");
    acquireSlotLock(key, "tab-a");
 
    vi.advanceTimersByTime(LOCK_TTL_MS - 1_000);
 
    expect(getSlotLock(key)?.holderId).toBe("tab-a");
    expect(acquireSlotLock(key, "tab-b")).toBe(false);
  });
});
 
describe("subscribeToLockChanges", () => {
  it("notifies subscribers when another tab's storage write fires the native storage event", () => {
    const onChange = vi.fn();
    const unsubscribe = subscribeToLockChanges(onChange);
 
    // The native `storage` event only fires in *other* documents than the
    // one that wrote the value, so we dispatch it manually here to
    // simulate that cross-tab signal.
    window.dispatchEvent(
      new StorageEvent("storage", { key: "gw-slot-lock:gw-chidi|2026-07-24|09:00" })
    );
 
    expect(onChange).toHaveBeenCalledTimes(1);
    unsubscribe();
  });
 
  it("ignores storage events for unrelated keys", () => {
    const onChange = vi.fn();
    const unsubscribe = subscribeToLockChanges(onChange);
 
    window.dispatchEvent(new StorageEvent("storage", { key: "some-unrelated-key" }));
 
    expect(onChange).not.toHaveBeenCalled();
    unsubscribe();
  });
 
  it("stops notifying after unsubscribe", () => {
    const onChange = vi.fn();
    const unsubscribe = subscribeToLockChanges(onChange);
    unsubscribe();
 
    window.dispatchEvent(
      new StorageEvent("storage", { key: "gw-slot-lock:gw-chidi|2026-07-24|09:00" })
    );
 
    expect(onChange).not.toHaveBeenCalled();
  });
});