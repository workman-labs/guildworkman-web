import AdinkraPattern from "./brand/AdinkraPattern";

const STATS = [
  { v: "₦2.4M", label: "held in escrow this week", cur: "₦" },
  { v: "12,400", label: "verified pros on the guild" },
  { v: "4.8★", label: "average job rating", cur: "★" },
  { v: "~18", label: "min average reply time", suffix: " min" },
];

export default function StatsBand() {
  return (
    <section className="px-5 md:px-10">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-[#20305c] to-navy-ink p-8 text-[#eaeef8] sm:p-12">
        <AdinkraPattern id="adpat-stats" color="var(--gold)" opacity={0.08} />
        <div className="relative grid grid-cols-2 gap-x-5 gap-y-7 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-extrabold tabular-nums sm:text-4xl">
                {s.v.split("").map((ch, i) =>
                  s.cur && ch === s.cur ? (
                    <span key={i} className="text-gold-2">
                      {ch}
                    </span>
                  ) : (
                    <span key={i}>{ch}</span>
                  )
                )}
                {s.suffix ? <span className="text-[0.5em] font-bold">{s.suffix}</span> : null}
              </div>
              <div className="mt-2 text-sm font-semibold text-[#b9c3dc]">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
