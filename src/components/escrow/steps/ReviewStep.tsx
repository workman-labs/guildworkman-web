import { FaLock } from "react-icons/fa6";
import { formatNaira } from "@/lib/marketplace";
import type { EscrowFundingContext } from "@/lib/escrowFunding";

export default function ReviewStep({ context }: { context: EscrowFundingContext }) {
  return (
    <div>
      <h2 className="font-heading text-xl font-semibold">Review booking details</h2>
      <p className="text-muted mt-1 mb-6">
        Confirm the amount before locking it in escrow for {context.workerName}.
      </p>
      <dl className="grid gap-3 text-sm">
        <div className="flex items-center justify-between rounded-lg bg-sand px-3.5 py-3">
          <dt className="text-muted">Booking reference</dt>
          <dd className="font-mono font-semibold text-ink">{context.bookingRef}</dd>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-sand px-3.5 py-3">
          <dt className="text-muted">Worker</dt>
          <dd className="font-semibold text-ink">{context.workerName}</dd>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-sand px-3.5 py-3">
          <dt className="text-muted">Amount to fund</dt>
          <dd className="font-extrabold tabular-nums text-ink">{formatNaira(context.amount)}</dd>
        </div>
      </dl>
      <p className="mt-5 flex items-start gap-2 text-sm text-muted">
        <FaLock className="mt-0.5 shrink-0 text-xs" aria-hidden />
        Once funded, this amount is held in escrow on Stellar and released only when you confirm
        the job&apos;s done — or refunded in full if it falls through.
      </p>
    </div>
  );
}
