"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { fetchStatus, submitAction } from "@/lib/escrowChain";
import {
  actionsFor,
  confirmedStatus,
  effectiveStatus,
  initialTimelineState,
  timelineReducer,
  type EscrowAction,
  type TimelineState,
} from "@/lib/escrowTimeline";

/** How often to poll the chain for the authoritative status. Fast enough that
    an externally-driven change feels live, slow enough not to hammer the RPC
    once this points at a real endpoint. */
const POLL_INTERVAL_MS = 4000;

function newSubmissionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `sub-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export interface UseEscrowTimeline {
  state: TimelineState;
  /** The status the UI should present (optimistic target while in flight). */
  displayStatus: ReturnType<typeof effectiveStatus>;
  /** The authoritative confirmed status. */
  settledStatus: ReturnType<typeof confirmedStatus>;
  /** Actions currently legal — empty while a submission is in flight. */
  availableActions: EscrowAction[];
  /** True while an optimistic action is awaiting confirmation. */
  isSubmitting: boolean;
  /** ISO timestamp of the last successful poll, or null before the first. */
  lastSyncedAt: string | null;
  submit: (action: EscrowAction) => void;
  retry: () => void;
  dismissError: () => void;
}

export function useEscrowTimeline(bookingRef: string, fundedAt: string): UseEscrowTimeline {
  const [state, dispatch] = useReducer(
    timelineReducer,
    undefined,
    () => initialTimelineState(fundedAt),
  );
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  // Remember the last submitted action so `retry` can re-run it after a
  // rolled-back failure without the component tracking it separately.
  const lastActionRef = useRef<EscrowAction | null>(null);
  // Guards against dispatching after unmount from an in-flight submission.
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const runSubmit = useCallback(
    async (action: EscrowAction) => {
      const submissionId = newSubmissionId();
      lastActionRef.current = action;
      dispatch({ type: "SUBMIT", action, submissionId, at: new Date().toISOString() });
      try {
        const result = await submitAction(bookingRef, action);
        if (!mountedRef.current) return;
        dispatch({
          type: "CONFIRMED",
          submissionId,
          txHash: result.txHash ?? "",
          at: result.at,
        });
      } catch (error) {
        if (!mountedRef.current) return;
        dispatch({
          type: "FAILED",
          submissionId,
          message: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        });
      }
    },
    [bookingRef],
  );

  const submit = useCallback(
    (action: EscrowAction) => {
      // Cheap client-side guard mirroring the reducer's own check, so an
      // illegal action never even starts a network round trip.
      if (!actionsFor(confirmedStatus(state)).includes(action)) return;
      if (state.pending) return;
      void runSubmit(action);
    },
    [runSubmit, state],
  );

  const retry = useCallback(() => {
    const action = lastActionRef.current;
    if (action) void runSubmit(action);
  }, [runSubmit]);

  const dismissError = useCallback(() => dispatch({ type: "DISMISS_ERROR" }), []);

  // Poll the chain for the authoritative status. Pauses while the tab is
  // hidden (no point polling a backgrounded tab) and polls once immediately on
  // becoming visible again so the timeline is fresh the moment the user returns.
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    async function poll() {
      try {
        const result = await fetchStatus(bookingRef);
        if (cancelled) return;
        setLastSyncedAt(result.at);
        dispatch({ type: "SYNC", status: result.status, txHash: result.txHash, at: result.at });
      } catch {
        // A failed poll is non-fatal; the next tick tries again.
      }
    }

    function start() {
      if (timer) return;
      void poll();
      timer = setInterval(poll, POLL_INTERVAL_MS);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function handleVisibility() {
      if (document.visibilityState === "hidden") stop();
      else start();
    }

    if (typeof document !== "undefined" && document.visibilityState === "visible") start();
    else if (typeof document === "undefined") start();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;
      stop();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [bookingRef]);

  return {
    state,
    displayStatus: effectiveStatus(state),
    settledStatus: confirmedStatus(state),
    availableActions: state.pending ? [] : actionsFor(confirmedStatus(state)),
    isSubmitting: state.pending !== null,
    lastSyncedAt,
    submit,
    retry,
    dismissError,
  };
}
