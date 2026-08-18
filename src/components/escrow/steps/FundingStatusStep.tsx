import { FaCircleCheck, FaCircleExclamation, FaSpinner } from "react-icons/fa6";
import { formatNaira } from "@/lib/marketplace";
import type { EscrowFundingContext, EscrowStateName } from "@/lib/escrowFunding";

interface FundingStatusStepProps {
  state: Extract<EscrowStateName, "funding" | "funded" | "failed">;
  context: EscrowFundingContext;
}

export default function FundingStatusStep({ state, context }: FundingStatusStepProps) {
  if (state === "funding") {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <FaSpinner className="mb-4 animate-spin text-3xl text-navy-2" aria-hidden />
        <h2 className="font-heading text-xl font-semibold">Funding escrow…</h2>
        <p className="text-muted mt-1">
          Locking {formatNaira(context.amount)} on Stellar. This usually takes a few seconds.
        </p>
      </div>
    );
  }

  if (state === "funded") {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <FaCircleCheck className="mb-4 text-3xl text-ok" aria-hidden />
        <h2 className="font-heading text-xl font-semibold">Escrow funded</h2>
        <p className="text-muted mt-1">
          {formatNaira(context.amount)} is now held in escrow for {context.workerName}.
        </p>
        {context.escrowReference && (
          <p className="mt-3 rounded-lg bg-sand px-3 py-2 font-mono text-sm text-ink">
            {context.escrowReference}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-8 text-center">
      <FaCircleExclamation className="mb-4 text-3xl text-err" aria-hidden />
      <h2 className="font-heading text-xl font-semibold">Funding failed</h2>
      <p role="alert" className="text-muted mt-1">
        {context.errorMessage ?? "Something went wrong. Please try again."}
      </p>
    </div>
  );
}
