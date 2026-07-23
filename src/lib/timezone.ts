/**
 * Timezone-aware helpers for the booking calendar.
 *
 * BACKGROUND
 * The backend's `scheduleTime` is a bare `LocalDateTime` with no zone info
 * (see `ViewAllAppointmentsResponse.scheduleTime` in lib/types.ts) — every
 * date/time string the API sends and receives is implicitly a wall-clock
 * reading in the provider's own local time, which for GuildWorkman today
 * is always Lagos, Nigeria. There's no per-visitor zone stored anywhere on
 * the backend.
 *
 * So "timezone-aware" here means: the source of truth for a slot is a wall
 * clock time in PROVIDER_TIME_ZONE. This module turns that into a real
 * point in time (a UTC instant) and re-renders it in whatever zone the
 * visitor's browser reports, so someone browsing from London or New York
 * sees slot times in *their* local time instead of silently seeing WAT and
 * showing up at the wrong hour.
 */

/** The single provider zone every `scheduleTime` on the backend is anchored
    to. Becomes a lookup (per worker/region) if GuildWorkman ever operates
    outside Lagos — hardcoded for now since the backend has no concept of
    worker timezone either. */
export const PROVIDER_TIME_ZONE = "Africa/Lagos";

export function getVisitorTimeZone(): string {
  if (typeof Intl === "undefined") return PROVIDER_TIME_ZONE;
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || PROVIDER_TIME_ZONE;
  } catch {
    return PROVIDER_TIME_ZONE;
  }
}

interface DateTimeParts {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
}

/** Reads the wall-clock date/time `instant` shows when viewed in `zone`. */
function getZonedParts(instant: Date, zone: string): DateTimeParts {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  const parts = dtf.formatToParts(instant).reduce<Record<string, string>>((acc, p) => {
    if (p.type !== "literal") acc[p.type] = p.value;
    return acc;
  }, {});
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    // Intl reports midnight as "24" in some environments with hour12:false.
    hour: Number(parts.hour) % 24,
    minute: Number(parts.minute),
  };
}

/** Minutes to ADD to a UTC instant to get the wall-clock reading in `zone`
    at that moment (e.g. Lagos/WAT is UTC+1 → returns +60). Computed by
    asking Intl what `zone` reads at `instant` and diffing against UTC,
    rather than hardcoding an offset, so zones that observe DST stay
    correct across the year. */
function getOffsetMinutes(instant: Date, zone: string): number {
  const zoned = getZonedParts(instant, zone);
  const asUtc = Date.UTC(zoned.year, zoned.month - 1, zoned.day, zoned.hour, zoned.minute);
  return Math.round((asUtc - instant.getTime()) / 60_000);
}

/**
 * Converts a "wall clock" date + time meant to be read in `zone` into a
 * real UTC instant (a `Date`).
 */
export function zonedTimeToUtc(dateIso: string, time: string, zone: string): Date {
  const [year, month, day] = dateIso.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const naiveUtc = Date.UTC(year, month - 1, day, hour, minute);

  const firstOffset = getOffsetMinutes(new Date(naiveUtc), zone);
  const candidate = naiveUtc - firstOffset * 60_000;

  const secondOffset = getOffsetMinutes(new Date(candidate), zone);
  return new Date(naiveUtc - secondOffset * 60_000);
}

export interface ZonedSlot {
  /** "HH:mm" as it reads in the target zone. */
  time: string;
  dayOffset: number;
}

/** Converts a provider-local `dateIso` + `time` into how it reads in
    `zone`, plus how many calendar days that reading has drifted. */
export function convertSlotToZone(dateIso: string, time: string, zone: string): ZonedSlot {
  const utcInstant = zonedTimeToUtc(dateIso, time, PROVIDER_TIME_ZONE);
  const zoned = getZonedParts(utcInstant, zone);

  const providerMidnightUtc = zonedTimeToUtc(dateIso, "00:00", PROVIDER_TIME_ZONE);
  const zonedMidnightSameDay = Date.UTC(zoned.year, zoned.month - 1, zoned.day);
  const providerMidnightZoned = getZonedParts(providerMidnightUtc, zone);
  const providerDayInZoneUtc = Date.UTC(
    providerMidnightZoned.year,
    providerMidnightZoned.month - 1,
    providerMidnightZoned.day
  );
  const dayOffset = Math.round((zonedMidnightSameDay - providerDayInZoneUtc) / 86_400_000);

  return {
    time: `${String(zoned.hour).padStart(2, "0")}:${String(zoned.minute).padStart(2, "0")}`,
    dayOffset,
  };
}

/** A short human label for a zone's current offset, e.g. "GMT+1" — used in
    the "times shown in your timezone" banner. Falls back to the bare zone
    name if the runtime doesn't support `timeZoneName: "shortOffset"`. */
export function offsetLabel(zone: string, at: Date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      timeZoneName: "shortOffset",
    }).formatToParts(at);
    return parts.find((p) => p.type === "timeZoneName")?.value ?? zone;
  } catch {
    return zone;
  }
}

export function todayIsoInZone(zone: string): string {
  const { year, month, day } = getZonedParts(new Date(), zone);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
