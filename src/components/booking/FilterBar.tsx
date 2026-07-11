import { FaChevronDown } from "react-icons/fa6";

/* Presentational filter bar — reflects the intended UX. Wiring to
   skilledWorker/nearby + real sort/filter is a follow-up. */

function Chip({ label, value, active = false }: { label?: string; value: string; active?: boolean }) {
  return (
    <button
      type="button"
      className={`flex flex-shrink-0 items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-sm font-bold transition ${
        active ? "border-navy bg-navy text-white" : "border-line bg-surface hover:border-navy-2"
      }`}
    >
      {label ? (
        <span className={`font-semibold ${active ? "text-[#c9d2ea]" : "text-muted"}`}>{label}</span>
      ) : null}
      {value}
      <FaChevronDown aria-hidden className="text-[0.7rem] opacity-60" />
    </button>
  );
}

export default function FilterBar({ area }: { area: string }) {
  return (
    <div className="mb-5 flex gap-2.5 overflow-x-auto pb-1">
      <Chip value="Top rated" active />
      <Chip label="Area:" value={area} />
      <Chip label="Available:" value="Any time" />
      <Chip label="Price:" value="Any" />
    </div>
  );
}
