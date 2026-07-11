import { FaMagnifyingGlass, FaLock } from "react-icons/fa6";
import NorthStar from "./brand/NorthStar";

export default function HowItWorks() {
  return (
    <section id="how" className="bg-sand-2 px-5 py-16 md:px-10 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-7 max-w-2xl">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-terra">
            How it works
          </div>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Trust built into every booking
          </h2>
          <p className="mt-2 text-muted">
            Your money is held on-chain and only moves when you say the job is
            done — so booking a stranger stops feeling like a risk.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Step n="STEP 1" title="Find & book" icon={<FaMagnifyingGlass aria-hidden className="text-navy-2" />}>
            Search your area, compare verified pros by rating and price, and pick
            a time that works.
          </Step>
          <Step
            n="STEP 2"
            title="Pay into escrow"
            highlight
            icon={<FaLock aria-hidden className="text-gold-deep" />}
            chip="◆ Funds locked on-chain"
          >
            You pay upfront, but the pro can&apos;t touch it yet. Your Naira sits
            safely on Stellar until the work is finished.
          </Step>
          <Step n="STEP 3" title="Confirm & rate" icon={<NorthStar size={20} verified />}>
            Happy with the job? Release the funds and leave a rating that&apos;s
            permanently tied to their record.
          </Step>
        </div>
      </div>
    </section>
  );
}

function Step({
  n,
  title,
  icon,
  children,
  highlight = false,
  chip,
}: {
  n: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  highlight?: boolean;
  chip?: string;
}) {
  return (
    <div
      className={`rounded-2xl border bg-surface p-6 ${
        highlight ? "border-gold/55 shadow-float ring-1 ring-gold/40" : "border-line"
      }`}
    >
      <div className="font-mono text-sm font-bold text-gold-deep">{n}</div>
      <h3 className="mt-3 flex items-center gap-2.5 text-lg font-extrabold">
        {icon} {title}
      </h3>
      <p className="mt-2 text-muted">{children}</p>
      {chip ? (
        <span className="mt-3 inline-block rounded-lg bg-navy/8 px-2.5 py-1.5 text-xs font-bold text-navy-2">
          {chip}
        </span>
      ) : null}
    </div>
  );
}
