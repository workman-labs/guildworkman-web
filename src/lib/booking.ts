import type { CategoryKey } from "./marketplace";
import { PROVIDER_TIME_ZONE, todayIsoInZone } from "./timezone";

export interface Service {
  id: string;
  label: string;
  desc: string;
  price: number;
  /** Price is a "from" estimate (site visit / quote required). */
  from?: boolean;
}

const ELECTRICAL: Service[] = [
  { id: "diag", label: "Fault diagnosis & repair", desc: "Sockets, tripping, wiring faults · ~1–2 hrs", price: 8000 },
  { id: "wiring", label: "Wiring & socket installation", desc: "New points, fixtures, distribution board", price: 15000 },
  { id: "rewire", label: "Full house rewire", desc: "Quoted after a site visit", price: 60000, from: true },
  { id: "solar", label: "Inverter / solar setup", desc: "Install & configuration", price: 45000, from: true },
];

function generic(trade: string): Service[] {
  return [
    { id: "standard", label: `Standard ${trade.toLowerCase()} visit`, desc: "Assessment and standard work · ~1–2 hrs", price: 10000 },
    { id: "callout", label: "Call-out & quote", desc: "On-site assessment, quoted before work starts", price: 5000 },
    { id: "project", label: "Full project", desc: "Quoted after a consultation", price: 40000, from: true },
  ];
}

export function getServices(category: CategoryKey, trade: string): Service[] {
  return category === "electrical" ? ELECTRICAL : generic(trade);
}

/** Platform service fee, 10% of the base rate (mockup: ₦8,000 → ₦800). */
export function feeFor(price: number): number {
  return Math.round(price * 0.1);
}

export interface TimeSlot {
  t: string;
  off?: boolean;
}

export const TIME_SLOTS: TimeSlot[] = [
  { t: "08:00" },
  { t: "09:30", off: true },
  { t: "11:00" },
  { t: "12:30" },
  { t: "14:00" },
  { t: "16:00" },
];

export interface DateChip {
  iso: string;
  dow: string; // THU
  num: string; // 11
  label: string; // Fri 11 Jul (used in the summary)
  disabled: boolean; // Sundays closed
}

const DOW_SHORT = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const DOW_TITLE = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Compute the next `count` days on the server so the client hydrates
    from stable prop values (no midnight hydration mismatch).

    "Today" is anchored to PROVIDER_TIME_ZONE (Lagos) rather than the host
    machine's own clock — serverless hosts typically run in UTC, so around
    midnight WAT the old `new Date()` could compute the wrong "today" (and
    therefore the wrong 7-day window) for a Lagos-based calendar. The dates
    returned are still plain ISO day strings with no time component; slot
    *times* are converted to the visitor's zone client-side (see
    lib/timezone.ts) so this stays hydration-safe. */
export function buildDates(count = 7): DateChip[] {
  const todayIso = todayIsoInZone(PROVIDER_TIME_ZONE);
  const [y, m, d] = todayIso.split("-").map(Number);
  // Noon UTC avoids landing on a different calendar day when this Date is
  // later read back with .getDate()/.getDay() in the host's own zone.
  const today = new Date(Date.UTC(y, m - 1, d, 12));
  return Array.from({ length: count }, (_, i) => {
    const day = new Date(today);
    day.setUTCDate(today.getUTCDate() + i);
    const dayIdx = day.getUTCDay();
    return {
      iso: day.toISOString().slice(0, 10),
      dow: DOW_SHORT[dayIdx],
      num: String(day.getUTCDate()),
      label: `${DOW_TITLE[dayIdx]} ${day.getUTCDate()} ${MONTHS[day.getUTCMonth()]}`,
      disabled: dayIdx === 0,
    };
  });
}
