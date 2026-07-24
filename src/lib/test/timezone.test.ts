import { describe, expect, it, vi, afterEach } from "vitest";
import {
  PROVIDER_TIME_ZONE,
  convertSlotToZone,
  getVisitorTimeZone,
  offsetLabel,
  todayIsoInZone,
  zonedTimeToUtc,
} from "../timezone";
 
// Fixed zones with no DST, chosen deliberately so the tests are stable
// year-round instead of depending on today's date relative to a DST
// boundary:
//   Africa/Lagos       UTC+1  (the provider zone itself)
//   Asia/Tokyo         UTC+9  (always ahead of Lagos -> exercises +1 day)
//   America/Phoenix    UTC-7  (always behind Lagos  -> exercises -1 day)
 
describe("zonedTimeToUtc", () => {
  it("converts a Lagos wall-clock reading to the matching UTC instant", () => {
    // 09:00 in Lagos (UTC+1) is 08:00 UTC.
    const utc = zonedTimeToUtc("2026-07-24", "09:00", PROVIDER_TIME_ZONE);
    expect(utc.toISOString()).toBe("2026-07-24T08:00:00.000Z");
  });
 
  it("is a no-op offset for midnight", () => {
    const utc = zonedTimeToUtc("2026-01-01", "00:00", PROVIDER_TIME_ZONE);
    expect(utc.toISOString()).toBe("2025-12-31T23:00:00.000Z");
  });
});
 
describe("convertSlotToZone", () => {
  it("keeps the same calendar day when the visitor zone is far enough ahead of Lagos midday", () => {
    // 09:00 Lagos -> Tokyo is Lagos+8h -> 17:00 same day.
    const zoned = convertSlotToZone("2026-07-24", "09:00", "Asia/Tokyo");
    expect(zoned).toEqual({ time: "17:00", dayOffset: 0 });
  });
 
  it("rolls forward a day when the visitor zone is ahead and the slot is late", () => {
    // 20:00 Lagos -> Tokyo is Lagos+8h -> 04:00 the next day.
    const zoned = convertSlotToZone("2026-07-24", "20:00", "Asia/Tokyo");
    expect(zoned).toEqual({ time: "04:00", dayOffset: 1 });
  });
 
  it("keeps the same calendar day when the visitor zone is behind but the slot is late enough", () => {
    // 09:00 Lagos -> Phoenix is Lagos-8h -> 01:00 same day.
    const zoned = convertSlotToZone("2026-07-24", "09:00", "America/Phoenix");
    expect(zoned).toEqual({ time: "01:00", dayOffset: 0 });
  });
 
  it("rolls back a day when the visitor zone is behind and the slot is early", () => {
    // 06:00 Lagos -> Phoenix is Lagos-8h -> 22:00 the previous day.
    const zoned = convertSlotToZone("2026-07-24", "06:00", "America/Phoenix");
    expect(zoned).toEqual({ time: "22:00", dayOffset: -1 });
  });
 
  it("is a no-op when converting to the provider's own zone", () => {
    const zoned = convertSlotToZone("2026-07-24", "14:30", PROVIDER_TIME_ZONE);
    expect(zoned).toEqual({ time: "14:30", dayOffset: 0 });
  });
});
 
describe("offsetLabel", () => {
  const at = new Date("2026-07-24T12:00:00Z");
 
  it("formats the provider zone", () => {
    expect(offsetLabel(PROVIDER_TIME_ZONE, at)).toBe("GMT+1");
  });
 
  it("formats a zone ahead of UTC", () => {
    expect(offsetLabel("Asia/Tokyo", at)).toBe("GMT+9");
  });
 
  it("formats a zone behind UTC", () => {
    expect(offsetLabel("America/Phoenix", at)).toBe("GMT-7");
  });
});
 
describe("todayIsoInZone", () => {
  afterEach(() => {
    vi.useRealTimers();
  });
 
  it("reports the Lagos calendar date even when the host clock is a UTC instant that has already rolled to the next day locally", () => {
    // 23:30 UTC on the 24th is already 00:30 on the 25th in Lagos (UTC+1).
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-24T23:30:00Z"));
    expect(todayIsoInZone(PROVIDER_TIME_ZONE)).toBe("2026-07-25");
  });
 
  it("reports the visitor's own calendar date the same way", () => {
    // 01:00 UTC on the 24th is still 17:00 on the 23rd in Phoenix (UTC-7).
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-24T01:00:00Z"));
    expect(todayIsoInZone("America/Phoenix")).toBe("2026-07-23");
  });
});
 
describe("getVisitorTimeZone", () => {
  it("falls back to the provider zone when Intl is unavailable", () => {
    const original = globalThis.Intl;
    // @ts-expect-error deliberately simulating an environment without Intl
    delete globalThis.Intl;
    expect(getVisitorTimeZone()).toBe(PROVIDER_TIME_ZONE);
    globalThis.Intl = original;
  });
 
  it("otherwise returns a non-empty IANA zone string", () => {
    expect(getVisitorTimeZone().length).toBeGreaterThan(0);
  });
});