import { HiCheck } from "react-icons/hi";
import { STEP_IDS, STEP_LABELS, type StepId } from "@/lib/identityVerification";

interface IdentityStepperProps {
  currentIndex: number;
  /** Highest index the user has successfully validated up to — steps at or
      before this are clickable, steps beyond it are disclosed but inert
      (progressive disclosure: visible so users know what's ahead, not yet
      reachable until earlier steps are complete). */
  furthestValidatedIndex: number;
  onStepSelect: (index: number) => void;
}

export default function IdentityStepper({
  currentIndex,
  furthestValidatedIndex,
  onStepSelect,
}: IdentityStepperProps) {
  return (
    <ol className="flex flex-wrap gap-x-6 gap-y-3 mb-8" aria-label="Verification progress">
      {STEP_IDS.map((id: StepId, index) => {
        const isCurrent = index === currentIndex;
        const isCompleted = index < furthestValidatedIndex || (index === furthestValidatedIndex && index < currentIndex);
        const isReachable = index <= furthestValidatedIndex;

        return (
          <li key={id} className="flex items-center gap-2">
            <button
              type="button"
              disabled={!isReachable}
              onClick={() => onStepSelect(index)}
              aria-current={isCurrent ? "step" : undefined}
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                isCurrent
                  ? "bg-navy text-white"
                  : isCompleted
                    ? "bg-ok text-white"
                    : "bg-line text-muted"
              } ${isReachable ? "cursor-pointer" : "cursor-not-allowed"}`}
            >
              {isCompleted ? <HiCheck /> : index + 1}
            </button>
            <span className={`text-sm ${isCurrent ? "font-semibold text-ink" : "text-muted"}`}>
              {STEP_LABELS[id]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
