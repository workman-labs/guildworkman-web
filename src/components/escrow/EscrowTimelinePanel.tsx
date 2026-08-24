"use client";

import { useEffect, useRef } from "react";
import { FaCircleExclamation, FaArrowsRotate } from "react-icons/fa6";
import Button, { type ButtonVariant } from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EscrowTimeline from "./EscrowTimeline";
import { useEscrowTimeline } from "./useEscrowTimeline";
import { useHydrated } from "./useHydrated";
import {
  ACTION_LABELS,
  STATUS_DESCRIPTIONS,
  STATUS_LABELS,
  TERMINAL_STATUSES,
  buildTimelineNodes,
  type EscrowAction,
} from "@/lib/escrowTimeline";

interface EscrowTimelinePanelProps {
  bookingRef: string;
  workerName: string;
  /** ISO timestamp the escrow was funded — the timeline's genesis entry. */
  fundedAt: string;
}

/** Which button style each action gets: the value-preserving happy paths lead,
    refund is a quiet secondary, and a dispute is a deliberate gold accent. */
const ACTION_VARIANT: Record<EscrowAction, ButtonVariant> = {
  release: "primary",
  resolve: "primary",
  cancel: "outline",
  dispute: "gold",
};

export default function EscrowTimelinePanel({ bookingRef, workerName, fundedAt }: EscrowTimelinePanelProps) {
  const timeline = useEscrowTimeline(bookingRef, fundedAt);
  const { state, displayStatus, settledStatus, availableActions, isSubmitting } = timeline;

  const mounted = useHydrated();
  const announceRef = useRef<HTMLDivElement>(null);
  const prevSettledRef = useRef(settledStatus);

  // Announce every *confirmed* status change to screen readers — the optimistic
  // node already carries its own aria-live, so this is specifically the "it
  // actually landed on-chain (or changed underneath us)" signal.
  useEffect(() => {
    if (prevSettledRef.current !== settledStatus && announceRef.current) {
      announceRef.current.textContent = `Escrow status is now ${STATUS_LABELS[settledStatus]}. ${STATUS_DESCRIPTIONS[settledStatus]}`;
    }
    prevSettledRef.current = settledStatus;
  }, [settledStatus]);

  const nodes = buildTimelineNodes(state);
  const isTerminal = TERMINAL_STATUSES.has(settledStatus) && !isSubmitting;

  return (
    <Card className="p-6 md:p-8">
      <div ref={announceRef} role="status" aria-live="polite" className="sr-only" />

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-semibold">Escrow status</h2>
          <p className="mt-1 text-sm text-muted">
            Booking <span className="font-mono text-ink">{bookingRef}</span> with {workerName}.
          </p>
        </div>
        <SyncIndicator lastSyncedAt={mounted ? timeline.lastSyncedAt : null} />
      </div>

      <EscrowTimeline nodes={nodes} />

      {state.error && (
        <div
          role="alert"
          className="mt-6 flex flex-col gap-3 rounded-xl border border-err/30 bg-err/8 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="flex items-start gap-2 text-sm text-err">
            <FaCircleExclamation className="mt-0.5 shrink-0" aria-hidden />
            <span>{state.error}</span>
          </p>
          <div className="flex shrink-0 gap-2">
            <Button size="sm" variant="outline" onClick={timeline.dismissError}>
              Dismiss
            </Button>
            <Button size="sm" onClick={timeline.retry}>
              Try again
            </Button>
          </div>
        </div>
      )}

      {availableActions.length > 0 && (
        <div className="mt-7 border-t border-line pt-6">
          <p className="mb-3 text-sm font-semibold text-ink">What would you like to do?</p>
          <div className="flex flex-wrap gap-3">
            {availableActions.map((action) => (
              <Button
                key={action}
                variant={ACTION_VARIANT[action]}
                disabled={isSubmitting}
                onClick={() => timeline.submit(action)}
              >
                {ACTION_LABELS[action]}
              </Button>
            ))}
          </div>
        </div>
      )}

      {isSubmitting && (
        <p className="mt-6 flex items-center gap-2 text-sm text-muted">
          <FaArrowsRotate className="animate-spin" aria-hidden />
          Submitting to the escrow contract — the timeline will confirm or roll back automatically.
        </p>
      )}

      {isTerminal && (
        <p className="mt-7 rounded-xl bg-sand px-4 py-3 text-sm text-muted">
          This escrow is settled — <span className="font-semibold text-ink">{STATUS_LABELS[displayStatus]}</span>. No
          further action is needed.
        </p>
      )}
    </Card>
  );
}

/** Small "live" badge: a pulsing dot plus when the status was last synced. */
function SyncIndicator({ lastSyncedAt }: { lastSyncedAt: string | null }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-ok/10 px-3 py-1 text-xs font-semibold text-ok">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-ok" />
      </span>
      {lastSyncedAt ? `Live · synced ${new Date(lastSyncedAt).toLocaleTimeString()}` : "Live"}
    </span>
  );
}
