"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useWallet } from "@/components/wallet";
import EscrowStepper from "./EscrowStepper";
import ReviewStep from "./steps/ReviewStep";
import ConnectWalletStep from "./steps/ConnectWalletStep";
import ConfirmStep from "./steps/ConfirmStep";
import FundingStatusStep from "./steps/FundingStatusStep";
import {
  STATE_ANNOUNCEMENTS,
  clearEscrowProgress,
  fundEscrow,
  initialEscrowState,
  loadEscrowProgress,
  progressIndex,
  saveEscrowProgress,
  transition,
  type EscrowFundingContext,
  type EscrowState,
} from "@/lib/escrowFunding";

interface EscrowFundingWizardProps {
  bookingRef: string;
  amount: number;
  workerName: string;
}

export default function EscrowFundingWizard({ bookingRef, amount, workerName }: EscrowFundingWizardProps) {
  const baseContext: EscrowFundingContext = {
    bookingRef,
    amount,
    workerName,
    walletAddress: null,
    errorMessage: null,
    escrowReference: null,
  };

  const [state, setState] = useState<EscrowState>(() => initialEscrowState(baseContext));
  const [furthestIndex, setFurthestIndex] = useState(0);
  const [resumeAvailable, setResumeAvailable] = useState<{ savedAt: string } | null>(null);
  const [resumeChecked, setResumeChecked] = useState(false);

  const wallet = useWallet();
  const announceRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Offer to resume a saved session once, on mount.
  useEffect(() => {
    const saved = loadEscrowProgress(bookingRef);
    if (saved) {
      setResumeAvailable({ savedAt: saved.savedAt });
    }
    setResumeChecked(true);
  }, [bookingRef]);

  // Persist on every transition (the lib skips terminal/transient states).
  useEffect(() => {
    if (!resumeChecked) return;
    saveEscrowProgress(state);
  }, [state, resumeChecked]);

  // Move focus to the new step's heading on every transition, and announce
  // it via the aria-live region — this is what makes the flow usable with a
  // screen reader: focus alone doesn't guarantee the change is spoken if the
  // heading text hasn't visually changed order, and a live region alone
  // doesn't move sighted-keyboard-user focus back to the top of the step.
  useEffect(() => {
    if (announceRef.current) {
      announceRef.current.textContent = STATE_ANNOUNCEMENTS[state.name];
    }
    headingRef.current?.focus();
  }, [state.name]);

  function dispatch(event: Parameters<typeof transition>[1]) {
    setState((prev) => {
      const next = transition(prev, event);
      setFurthestIndex((idx) => Math.max(idx, progressIndex(next.name)));
      return next;
    });
  }

  function handleResume() {
    const saved = loadEscrowProgress(bookingRef);
    if (saved) {
      setState({ name: saved.name, context: saved.context });
      setFurthestIndex(progressIndex(saved.name));
    }
    setResumeAvailable(null);
  }

  function handleStartOver() {
    clearEscrowProgress(bookingRef);
    setState(initialEscrowState(baseContext));
    setFurthestIndex(0);
    setResumeAvailable(null);
  }

  function handleStepSelect(index: number) {
    const target = ["review", "connectWallet", "confirm", "funding", "funded"] as const;
    const name = target[index];
    if (index <= furthestIndex && name !== "funding" && name !== "funded") {
      setState((prev) => ({ name, context: prev.context }));
    }
  }

  async function handleConnectWallet() {
    await wallet.connect();
  }

  // Only advance past this step once the wallet is both connected *and* on
  // the expected network — funding on the wrong network isn't recoverable
  // after the fact, so the guard has to block progress here, not just warn.
  useEffect(() => {
    if (wallet.address && !wallet.isWrongNetwork && state.name === "connectWallet") {
      dispatch({ type: "WALLET_CONNECTED", address: wallet.address });
    }
  }, [wallet.address, wallet.isWrongNetwork, state.name]);

  async function handleFund() {
    dispatch({ type: "FUND_START" });
    try {
      const result = await fundEscrow(state.context);
      dispatch({ type: "FUND_SUCCESS", escrowReference: result.escrowReference });
      clearEscrowProgress(bookingRef);
    } catch (error) {
      dispatch({
        type: "FUND_ERROR",
        message: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      });
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    // Enter anywhere in the wizard body advances the primary action, unless
    // focus is on an interactive element that already handles Enter itself
    // (a link, or a button — which would otherwise double-fire).
    const target = event.target as HTMLElement;
    if (event.key === "Enter" && target.tagName !== "BUTTON" && target.tagName !== "A") {
      if (state.name === "review") {
        event.preventDefault();
        dispatch({ type: "CONTINUE" });
      } else if (state.name === "confirm") {
        event.preventDefault();
        handleFund();
      }
    }
  }

  return (
    <Card className="p-6 md:p-8 max-w-xl mx-auto" onKeyDown={handleKeyDown}>
      {/* Screen-reader-only live region: announces every state transition. */}
      <div ref={announceRef} role="status" aria-live="polite" className="sr-only" />

      {resumeAvailable && (
        <div className="mb-6 rounded-xl bg-navy-tint text-navy-2 text-sm p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <span>
            You have an unfinished escrow funding session from{" "}
            {new Date(resumeAvailable.savedAt).toLocaleString()}.
          </span>
          <div className="flex gap-2 shrink-0">
            <Button size="sm" variant="secondary" onClick={handleResume}>
              Resume
            </Button>
            <Button size="sm" variant="outline" onClick={handleStartOver}>
              Start over
            </Button>
          </div>
        </div>
      )}

      <EscrowStepper currentState={state.name} furthestIndex={furthestIndex} onStepSelect={handleStepSelect} />

      {/* Focus target for each step — tabIndex=-1 makes it programmatically
          focusable without adding a tab stop. */}
      <h1 ref={headingRef} tabIndex={-1} className="sr-only">
        {STATE_ANNOUNCEMENTS[state.name]}
      </h1>

      <div className="mb-6">
        {state.name === "review" && <ReviewStep context={state.context} />}
        {state.name === "connectWallet" && (
          <ConnectWalletStep
            address={wallet.address}
            connecting={wallet.connecting}
            freighterMissing={wallet.freighterMissing}
            error={wallet.error}
            isWrongNetwork={wallet.isWrongNetwork}
            network={wallet.network}
            expectedNetwork={wallet.expectedNetwork}
            onConnect={handleConnectWallet}
          />
        )}
        {state.name === "confirm" && <ConfirmStep context={state.context} />}
        {(state.name === "funding" || state.name === "funded" || state.name === "failed") && (
          <FundingStatusStep state={state.name} context={state.context} />
        )}
      </div>

      <div className="flex justify-between gap-3">
        {state.name === "review" && (
          <>
            <span />
            <Button onClick={() => dispatch({ type: "CONTINUE" })}>Continue</Button>
          </>
        )}

        {state.name === "connectWallet" && (
          <>
            <Button variant="outline" onClick={() => dispatch({ type: "BACK" })}>
              Back
            </Button>
            <span />
          </>
        )}

        {state.name === "confirm" && (
          <>
            <Button variant="outline" onClick={() => dispatch({ type: "BACK" })}>
              Back
            </Button>
            <Button onClick={handleFund}>Fund escrow</Button>
          </>
        )}

        {state.name === "failed" && (
          <>
            <Button variant="outline" onClick={() => dispatch({ type: "RESTART" })}>
              Start over
            </Button>
            <Button onClick={() => dispatch({ type: "RETRY" })}>Back to confirm</Button>
          </>
        )}

        {state.name === "funded" && <span />}
      </div>
    </Card>
  );
}
