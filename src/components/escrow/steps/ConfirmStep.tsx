import { FaLock } from "react-icons/fa6";
import { formatNaira } from "@/lib/marketplace";
import { truncateAddress } from "@/lib/wallet";
import type { EscrowFundingContext } from "@/lib/escrowFunding";

export default function ConfirmStep({ context }: { context: EscrowFundingContext }) {
  return (
    <div>
      <h2 className="font-heading text-xl font-semibold">Confirm & fund escrow</h2>
      <p className="text-muted mt-1 mb-6">
        Double-check the details below, then fund the escrow contract from your connected wallet.
      </p>
      <div className="rounded-xl border border-navy/15 bg-navy-tint p-4">
        <div className="flex items-center gap-2 font-extrabold text-navy-2">
          <FaLock aria-hidden /> {formatNaira(context.amount)} will be locked in escrow
        </div>
        <p className="mt-2 text-sm text-muted">
          Paying from{" "}
          <span className="font-mono text-ink">
            {context.walletAddress ? truncateAddress(context.walletAddress) : "—"}
          </span>{" "}
          to {context.workerName} for booking{" "}
          <span className="font-mono text-ink">{context.bookingRef}</span>.
        </p>
      </div>
    </div>
  );
}
