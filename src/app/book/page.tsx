import { FaMagnifyingGlass, FaLocationDot } from "react-icons/fa6";
import Stepper from "@/components/booking/Stepper";
import TradeCard from "@/components/booking/TradeCard";
import { CATEGORIES } from "@/lib/marketplace";

export default function BookPage() {
  return (
    <>
      <Stepper
        steps={[
          { label: "Choose a trade", state: "current" },
          { label: "Choose a pro", state: "todo" },
          { label: "Book & pay", state: "todo" },
        ]}
      />
      <div className="mx-auto max-w-5xl px-5 pb-16 pt-6 md:px-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface py-1.5 pl-3 pr-1.5 text-sm font-bold shadow-card">
          <FaLocationDot aria-hidden className="text-terra" /> Yaba, Lagos
          <span className="rounded-full bg-navy-tint px-2.5 py-1 text-xs font-bold text-navy-2">Change</span>
        </span>

        <h1 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
          What do you need done?
        </h1>
        <p className="mt-1 text-muted">
          Pick a trade to see verified pros near you. Every booking is escrow-protected.
        </p>

        <label className="mt-5 flex items-center gap-2.5 rounded-xl border border-line bg-surface px-4 py-3 shadow-card">
          <FaMagnifyingGlass aria-hidden className="text-muted" />
          <input
            aria-label="Search a trade or service"
            placeholder="Search a trade or service — e.g. inverter install, gele, rewiring"
            className="w-full bg-transparent text-[0.98rem] outline-none placeholder:text-muted"
          />
        </label>

        <div className="mt-5 grid grid-cols-2 gap-3.5 sm:grid-cols-3">
          {CATEGORIES.map((c) => (
            <TradeCard key={c.key} category={c} />
          ))}
        </div>
      </div>
    </>
  );
}
