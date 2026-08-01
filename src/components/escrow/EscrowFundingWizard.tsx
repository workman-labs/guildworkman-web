"use client";

import { useEffect } from "react";
import { useEscrowWizard, STEP_LABELS } from "@/hooks/useEscrowWizard";
import EscrowStepIndicator from "./EscrowStepIndicator";
import EscrowFundingForm from "./EscrowFundingForm";
import EscrowMilestoneForm from "./EscrowMilestoneForm";
import EscrowReviewConfirm from "./EscrowReviewConfirm";
import EscrowWalletConnect from "./EscrowWalletConnect";
import EscrowSuccess from "./EscrowSuccess";

const STEPS = ["funding", "milestones", "review", "wallet", "success"] as const;
const STEPS_NO_SUCCESS = ["funding", "milestones", "review", "wallet"] as const;

export default function EscrowFundingWizard() {
  const {
    state,
    updateFunding,
    setMilestones,
    next,
    back,
    submit,
    reset,
    headingRef,
    totalStep,
    currentStepIndex,
  } = useEscrowWizard();

  const completedUpTo = STEPS.indexOf(state.step) - 1;

  // Announce step changes to screen readers
  useEffect(() => {
    if (state.announcement) {
      const announcer = document.getElementById("escrow-announcer");
      if (announcer) {
        announcer.textContent = state.announcement;
      }
    }
  }, [state.announcement]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Screen-reader live region */}
      <div
        id="escrow-announcer"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Step indicator — only show during active steps */}
      {state.step !== "success" && (
        <div className="mb-8">
          <EscrowStepIndicator
            steps={STEPS_NO_SUCCESS}
            currentStep={state.step}
            completedUpTo={completedUpTo}
          />
        </div>
      )}

      {/* Step title */}
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="text-2xl sm:text-3xl font-bold text-navy mb-2 outline-none"
      >
        {STEP_LABELS[state.step]}
      </h1>
      <p className="text-sm text-muted mb-8">
        Step {currentStepIndex} of {totalStep - 1}
      </p>

      {/* Step content */}
      {state.step === "funding" && (
        <EscrowFundingForm
          data={state.data}
          onUpdate={updateFunding}
          onNext={next}
        />
      )}

      {state.step === "milestones" && (
        <EscrowMilestoneForm
          milestones={state.data.milestones}
          onSetMilestones={setMilestones}
          onBack={back}
          onNext={next}
        />
      )}

      {state.step === "review" && (
        <EscrowReviewConfirm
          data={state.data}
          onBack={back}
          onSubmit={submit}
        />
      )}

      {state.step === "wallet" && (
        <EscrowWalletConnect onBack={back} onConfirm={submit} />
      )}

      {state.step === "success" && (
        <EscrowSuccess
          escrowData={{
            amount: state.data.amount,
            recipient: state.data.recipient,
            memo: state.data.memo,
          }}
          onReset={reset}
        />
      )}
    </div>
  );
}