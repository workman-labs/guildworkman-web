import {
  FaMagnifyingGlass,
  FaLocationDot,
  FaShieldHalved,
  FaClock,
  FaCheck,
} from "react-icons/fa6";
import NorthStar from "./brand/NorthStar";
import AdinkraPattern from "./brand/AdinkraPattern";
import WorkerCard from "./marketplace/WorkerCard";
import { buttonClasses } from "./ui/Button";
import { FEATURED_WORKERS, TRADES, LAGOS_AREAS } from "@/lib/marketplace";

function SelectField({
  label,
  icon,
  options,
  name,
}: {
  label: string;
  icon: React.ReactNode;
  options: string[];
  name: string;
}) {
  return (
    <label className="flex items-center gap-2.5 rounded-xl bg-sand px-3.5 py-2.5">
      <span className="shrink-0 text-muted">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[0.62rem] font-bold uppercase tracking-wider text-muted">
          {label}
        </span>
        <select
          name={name}
          aria-label={label}
          className="w-full cursor-pointer appearance-none bg-transparent font-semibold text-ink outline-none"
        >
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </span>
    </label>
  );
}

export default function Hero() {
  const heroWorkers = FEATURED_WORKERS.slice(0, 2);

  return (
    <header className="px-5 py-12 md:px-10 md:py-16 lg:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14">
        {/* copy + search */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-bold shadow-card">
            <NorthStar size={16} /> Payments held in escrow until the job&apos;s done
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
            Find a skilled pro.{" "}
            <span className="text-terra">Pay when it&apos;s done.</span>
          </h1>
          <p className="mt-4 max-w-md text-lg text-muted">
            Book vetted electricians, plumbers, carpenters, stylists and more near
            you — with <b className="font-semibold text-ink">on-chain escrow</b>
            {" "}and ratings you can actually trust.
          </p>

          <form
            action="/book"
            className="mt-6 grid gap-2 rounded-2xl border border-line bg-surface p-2 shadow-float sm:grid-cols-[1fr_1fr_auto]"
          >
            <SelectField
              label="I need a…"
              name="trade"
              icon={<FaMagnifyingGlass aria-hidden />}
              options={TRADES}
            />
            <SelectField
              label="Near"
              name="area"
              icon={<FaLocationDot aria-hidden />}
              options={LAGOS_AREAS}
            />
            <button type="submit" className={buttonClasses("gold", "md", "w-full sm:w-auto")}>
              Search
            </button>
          </form>

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-muted">
            <span className="inline-flex items-center gap-2">
              <FaShieldHalved aria-hidden className="text-gold-deep" /> 12,400+ verified pros
            </span>
            <span className="inline-flex items-center gap-2">
              <NorthStar size={15} color="var(--gold-deep)" /> 4.8 average rating
            </span>
            <span className="inline-flex items-center gap-2">
              <FaClock aria-hidden className="text-gold-deep" /> Replies in ~18 min
            </span>
          </div>
        </div>

        {/* product-forward visual */}
        <div className="relative flex flex-col justify-center gap-4 overflow-hidden rounded-3xl bg-gradient-to-br from-[#20305c] via-navy to-navy-ink p-6 shadow-float sm:p-8 lg:min-h-[360px]">
          <AdinkraPattern id="adpat-hero" color="var(--gold)" opacity={0.1} />
          <div className="relative flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#c9d2ea]">
            <NorthStar size={15} color="var(--gold-2)" /> Top-rated near you
          </div>
          {heroWorkers.map((w, i) => (
            <div key={w.id} className="relative" style={{ transform: i === 1 ? "translateX(14px)" : undefined }}>
              <WorkerCard worker={w} variant="row" />
            </div>
          ))}
          <div className="relative flex items-center gap-3 self-start rounded-xl bg-white px-4 py-2.5 text-navy-ink shadow-lg">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/30">
              <FaCheck aria-hidden className="text-sm text-gold-deep" />
            </span>
            <span className="text-sm font-bold">
              ₦25,000 released to Tunde
              <span className="block text-xs font-medium text-muted">
                Job confirmed · rating saved
              </span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
