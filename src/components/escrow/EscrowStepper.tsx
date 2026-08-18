"use client";

import { useRef } from "react";
import { HiCheck } from "react-icons/hi";
import { STATE_ORDER, STATE_LABELS, progressIndex, type EscrowStateName } from "@/lib/escrowFunding";

interface EscrowStepperProps {
  currentState: EscrowStateName;
  /** Highest step index reached so far — steps at or before this are
      selectable, steps beyond it are disclosed but inert (same progressive
      disclosure pattern as IdentityStepper). */
  furthestIndex: number;
  onStepSelect: (index: number) => void;
}

/** Accessible step nav: a roving-tabindex button group (arrow keys move
    focus, Enter/Space activates) with `aria-current` on the active step, so
    the whole stepper is a single stop in the page's tab order rather than
    one stop per step. */
export default function EscrowStepper({ currentState, furthestIndex, onStepSelect }: EscrowStepperProps) {
  const currentIndex = progressIndex(currentState);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function focusStep(index: number) {
    buttonRefs.current[index]?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      const next = Math.min(index + 1, STATE_ORDER.length - 1);
      focusStep(next);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      const prev = Math.max(index - 1, 0);
      focusStep(prev);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusStep(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusStep(STATE_ORDER.length - 1);
    }
  }

  return (
    <ol className="flex flex-wrap gap-x-6 gap-y-3 mb-8" aria-label="Escrow funding progress">
      {STATE_ORDER.map((name, index) => {
        const isCurrent = index === currentIndex;
        const isCompleted = index < furthestIndex || (index === furthestIndex && index < currentIndex);
        const isReachable = index <= furthestIndex;

        return (
          <li key={name} className="flex items-center gap-2">
            <button
              ref={(el) => {
                buttonRefs.current[index] = el;
              }}
              type="button"
              disabled={!isReachable}
              tabIndex={isCurrent ? 0 : -1}
              onClick={() => isReachable && onStepSelect(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              aria-current={isCurrent ? "step" : undefined}
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
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
              {STATE_LABELS[name]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
