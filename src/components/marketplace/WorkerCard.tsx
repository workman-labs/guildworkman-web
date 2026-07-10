import Link from "next/link";
import { FaLock } from "react-icons/fa6";
import NorthStar from "@/components/brand/NorthStar";
import RatingPill from "./RatingPill";
import { buttonClasses } from "@/components/ui/Button";
import { formatNaira, type Worker } from "@/lib/marketplace";

function Avatar({ worker, size = 50 }: { worker: Worker; size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full font-extrabold text-white"
      style={{ background: worker.avatar, width: size, height: size, fontSize: size * 0.34 }}
      aria-hidden="true"
    >
      {worker.initials}
    </span>
  );
}

function Name({ worker }: { worker: Worker }) {
  return (
    <span className="flex items-center gap-1.5 font-extrabold text-ink">
      {worker.name}
      <NorthStar size={15} verified title={`${worker.name} is verified`} />
    </span>
  );
}

function EscrowChip() {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-2">
      <FaLock aria-hidden className="text-[0.7rem]" /> Escrow-ready
    </span>
  );
}

interface WorkerCardProps {
  worker: Worker;
  variant?: "row" | "stack";
}

export default function WorkerCard({ worker, variant = "stack" }: WorkerCardProps) {
  if (variant === "row") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-line-2 bg-surface p-4 shadow-card">
        <Avatar worker={worker} />
        <div className="min-w-0 flex-1">
          <Name worker={worker} />
          <div className="truncate text-sm text-muted">
            {worker.trade} · {worker.area}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <RatingPill rating={worker.rating} reviews={worker.reviews} />
            <EscrowChip />
          </div>
        </div>
        <Link
          href={`/book/${worker.category}/${worker.id}`}
          className={buttonClasses("primary", "sm", "self-center")}
          aria-label={`Book ${worker.name}`}
        >
          Book
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5 shadow-card">
      <div className="flex items-center gap-3">
        <Avatar worker={worker} />
        <div className="min-w-0">
          <Name worker={worker} />
          <div className="truncate text-sm text-muted">
            {worker.trade} · {worker.area}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <RatingPill rating={worker.rating} reviews={worker.reviews} />
        <EscrowChip />
      </div>
      <div className="mt-1 flex items-center justify-between gap-3">
        <span className="text-sm text-muted">
          from{" "}
          <b className="font-extrabold text-ink tabular-nums">
            {formatNaira(worker.priceFrom)}
          </b>
        </span>
        <Link
          href={`/book/${worker.category}/${worker.id}`}
          className={buttonClasses("primary", "sm")}
          aria-label={`Book ${worker.name}`}
        >
          Book
        </Link>
      </div>
    </div>
  );
}
