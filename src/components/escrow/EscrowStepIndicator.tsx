"use client";

import { STEP_LABELS, WizardStep } from "@/hooks/useEscrowWizard";

interface EscrowStepIndicatorProps {
  steps: readonly WizardStep[];
  currentStep: WizardStep;
  /** Zero-based index of the last completed step (or -1 if none). */
  completedUpTo: number;
}

export default function EscrowStepIndicator({
  steps,
  currentStep,
  completedUpTo,
}: EscrowStepIndicatorProps) {
  return (
    <nav aria-label="Progress" className="w-full">
      <ol
        role="list"
        className="flex items-center justify-between gap-1 sm:gap-2"
      >
        {steps.map((step, index) => {
          const isCompleted = index <= completedUpTo;
          const isCurrent = step === currentStep;
          const isUpcoming = index > completedUpTo && !isCurrent;

          return (
            <li key={step} className="flex items-center gap-1 sm:gap-2 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Step number / icon */}
                <span
                  className={`flex size-7 sm:size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    isCompleted
                      ? "bg-navy text-white"
                      : isCurrent
                        ? "bg-gold text-navy-ink ring-2 ring-gold/30"
                        : "bg-line text-muted"
                  }`}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted ? (
                    <svg
                      className="size-3.5 sm:size-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </span>

                {/* Label — hidden on mobile, visible sm+ */}
                <span
                  className={`hidden sm:inline text-xs font-medium transition-colors ${
                    isCurrent
                      ? "text-navy"
                      : isCompleted
                        ? "text-ink"
                        : "text-muted"
                  }`}
                >
                  {STEP_LABELS[step]}
                </span>
              </div>

              {/* Connector line (not after last step) */}
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 rounded-full mx-1 ${
                    index < completedUpTo ? "bg-navy" : "bg-line"
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}