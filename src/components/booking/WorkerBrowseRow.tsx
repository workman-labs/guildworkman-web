import Link from "next/link";
import { FaLocationDot, FaLock } from "react-icons/fa6";
import NorthStar from "@/components/brand/NorthStar";
import { buttonClasses } from "@/components/ui/Button";
import { formatNaira, type Worker } from "@/lib/marketplace";

/** A worker row for the /book/[category] "choose a pro" list. */
export default function WorkerBrowseRow({ worker }: { worker: Worker }) {
  const bookHref = `/book/${worker.category}/${worker.id}`;
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 gap-y-0 rounded-2xl border border-line bg-surface p-4 shadow-card sm:grid-cols-[auto_minmax(0,1fr)_auto]">
      <span
        className="row-start-1 flex h-14 w-14 items-center justify-center rounded-full text-lg font-extrabold text-white"
        style={{ background: worker.avatar }}
        aria-hidden
      >
        {worker.initials}
      </span>

      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-[1.05rem] font-extrabold">
          {worker.name}
          <NorthStar size={16} verified title={`${worker.name} is verified`} />
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
          <span>{worker.trade}</span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 px-2 py-0.5 font-extrabold text-gold-deep">
            <NorthStar size={12} color="currentColor" />
            {worker.rating.toFixed(1)}
          </span>
          <span className="tabular-nums">({worker.reviews})</span>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-muted">
          <FaLocationDot aria-hidden className="text-terra" />
          {worker.area} · {worker.distanceKm}km away
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {worker.specialties.map((s) => (
            <span key={s} className="rounded-full bg-navy-tint px-2.5 py-1 text-xs font-bold text-navy-2">
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="col-span-full mt-3 flex items-center justify-between gap-3 border-t border-line-2 pt-3 sm:col-auto sm:mt-0 sm:flex-col sm:items-end sm:justify-center sm:border-none sm:pt-0 sm:text-right">
        <div>
          <div className="text-sm text-muted">
            from <b className="font-extrabold text-ink tabular-nums">{formatNaira(worker.priceFrom)}</b>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-2">
            <FaLock aria-hidden className="text-[0.7rem]" /> Escrow-ready
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={bookHref} className={buttonClasses("outline", "sm")}>
            View
          </Link>
          <Link href={bookHref} className={buttonClasses("primary", "sm")}>
            Book
          </Link>
        </div>
      </div>
    </div>
  );
}
