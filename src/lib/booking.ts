import type { CategoryKey } from "./marketplace";

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
    from stable prop values (no midnight hydration mismatch). */
export function buildDates(count = 7): DateChip[] {
  const today = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayIdx = d.getDay();
    return {
      iso: d.toISOString().slice(0, 10),
      dow: DOW_SHORT[dayIdx],
      num: String(d.getDate()),
      label: `${DOW_TITLE[dayIdx]} ${d.getDate()} ${MONTHS[d.getMonth()]}`,
      disabled: dayIdx === 0,
    };
  });
}
