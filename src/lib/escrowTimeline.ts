/**
 * Real-time escrow status timeline — the on-chain escrow lifecycle modeled as
 * an append-only event log, with optimistic updates and graceful rollback.
 *
 * WHY AN EVENT LOG (not a single "status" field)
 * An escrow *timeline* is inherently a history: it's funded, then released /
 * cancelled / disputed, and a dispute is later resolved. Rendering that as one
 * mutable `status` throws away exactly the thing the UI needs to draw — the
 * ordered sequence of transitions and when each happened. So the source of
 * truth here is `history: ConfirmedEntry[]` (chronological, always rooted at
 * "funded"), and the current status is simply its last entry. This also makes
 * the optimistic layer clean: an in-flight action is a single `pending` node
 * appended *after* the confirmed history, never a mutation of it, so rolling
 * back on failure is "drop the pending node" — the confirmed history is
 * untouched by construction.
 *
 * WHY OPTIMISTIC UPDATES + ROLLBACK ARE MODELED, NOT IMPROVISED
 * The reducer below is the single place that knows how a submitted action, an
 * on-chain confirmation, a failure, and a background poll each move the state.
 * Every (state, event) pair is handled in one pure function the UI and tests
 * drive directly, so "optimistically show Released, then snap back to Funded
 * if the tx fails" isn't ad-hoc `useState` juggling scattered across a
 * component — it's `SUBMIT` then `FAILED`, both covered by tests.
 *
 * WHY THIS TALKS TO A SIMULATED CHAIN (read before wiring a real endpoint)
 * Same reason the funding wizard's `fundEscrow` is a stub (see
 * `lib/escrowFunding.ts`): `guildworkman-core`'s Soroban `escrow` contract has
 * `Status { Funded, Completed, Cancelled, Disputed, Resolved }` and the
 * matching `complete` / `cancel` / `dispute` / `resolve` entrypoints, but no
 * backend REST/RPC endpoint exposes them to the web app yet. Rather than
 * invent a wire shape the backend can't answer, the chain functions at the
 * bottom of this file drive an in-memory ledger that behaves like the contract
 * (latency, an occasional failed submission, and status that other parties
 * could advance) so the optimistic UI, rollback, and real-time reconciliation
 * are fully exercised today. Swap those functions' bodies for real calls once
 * the integration lands — the reducer, hook, and components don't change.
 */

/** Mirrors the Soroban `escrow` contract's `Status` enum, lower-cased for the
    web layer. See `soroban-contracts/contracts/escrow/src/lib.rs`. */
export type EscrowStatus = "funded" | "completed" | "cancelled" | "disputed" | "resolved";

/** The state-changing entrypoints a client can invoke on the escrow contract.
    Named for the user intent rather than the raw contract method. */
export type EscrowAction = "release" | "cancel" | "dispute" | "resolve";

/** Canonical lifecycle order, used to lay the rail out top-to-bottom. The
    lifecycle branches after "funded" (completed | cancelled | disputed), so
    this is a display ordering, not a linear path every escrow walks. */
export const STATUS_ORDER: EscrowStatus[] = [
  "funded",
  "disputed",
  "resolved",
  "cancelled",
  "completed",
];

export const STATUS_LABELS: Record<EscrowStatus, string> = {
  funded: "Funded",
  completed: "Released",
  cancelled: "Refunded",
  disputed: "Disputed",
  resolved: "Resolved",
};

export const STATUS_DESCRIPTIONS: Record<EscrowStatus, string> = {
  funded: "Payment is locked in the escrow contract on Stellar.",
  completed: "Funds were released to the worker — the job is done.",
  cancelled: "The booking fell through; funds were refunded to the client.",
  disputed: "A dispute was raised. Funds stay locked pending resolution.",
  resolved: "The dispute was resolved and the escrow settled.",
};

/** Badge tone (see `components/ui/Badge`) for each status. */
export type StatusTone = "chain" | "success" | "gold" | "neutral";

export const STATUS_TONE: Record<EscrowStatus, StatusTone> = {
  funded: "chain",
  completed: "success",
  cancelled: "neutral",
  disputed: "gold",
  resolved: "success",
};

/** Once reached, no further action is possible. */
export const TERMINAL_STATUSES: ReadonlySet<EscrowStatus> = new Set<EscrowStatus>([
  "completed",
  "cancelled",
  "resolved",
]);

export const ACTION_LABELS: Record<EscrowAction, string> = {
  release: "Release funds",
  cancel: "Cancel & refund",
  dispute: "Raise dispute",
  resolve: "Resolve dispute",
};

/** The status an action moves the escrow to once confirmed on-chain. */
export const ACTION_TARGET: Record<EscrowAction, EscrowStatus> = {
  release: "completed",
  cancel: "cancelled",
  dispute: "disputed",
  resolve: "resolved",
};

/** Present-tense verb used while an action is optimistically in flight. */
export const ACTION_PENDING_LABELS: Record<EscrowAction, string> = {
  release: "Releasing funds…",
  cancel: "Refunding…",
  dispute: "Raising dispute…",
  resolve: "Resolving dispute…",
};

/** The legal actions from a given confirmed status — the single source of
    truth for which buttons the UI offers and which transitions the reducer
    accepts. Terminal statuses return an empty list. */
export function actionsFor(status: EscrowStatus): EscrowAction[] {
  switch (status) {
    case "funded":
      return ["release", "cancel", "dispute"];
    case "disputed":
      return ["resolve"];
    default:
      return [];
  }
}

/** A confirmed, on-chain transition. The first entry of every timeline is the
    genesis "funded" state, which has no originating action or tx hash. */
export interface ConfirmedEntry {
  status: EscrowStatus;
  action: EscrowAction | null;
  /** ISO-8601 timestamp of when the transition was observed on-chain. */
  at: string;
  /** Simulated Stellar tx hash; null for the genesis "funded" entry. */
  txHash: string | null;
}

/** An optimistic, not-yet-confirmed action shown at the end of the timeline. */
export interface PendingUpdate {
  action: EscrowAction;
  targetStatus: EscrowStatus;
  /** Local id correlating the optimistic node with its in-flight submission. */
  submissionId: string;
  /** ISO-8601 timestamp of when the user submitted. */
  at: string;
}

export interface TimelineState {
  /** Chronological confirmed history; `history[0]` is always "funded". */
  history: ConfirmedEntry[];
  /** The single in-flight optimistic action, or null when settled. */
  pending: PendingUpdate | null;
  /** Set when the last submission failed and was rolled back. */
  error: string | null;
}

export type TimelineEvent =
  /** User invoked an action — apply it optimistically. */
  | { type: "SUBMIT"; action: EscrowAction; submissionId: string; at: string }
  /** The in-flight submission confirmed on-chain. */
  | { type: "CONFIRMED"; submissionId: string; txHash: string; at: string }
  /** The in-flight submission failed — roll the optimistic node back. */
  | { type: "FAILED"; submissionId: string; message: string }
  /** A background poll observed the authoritative on-chain status. */
  | { type: "SYNC"; status: EscrowStatus; txHash: string | null; at: string }
  /** Dismiss a rolled-back error without submitting anything. */
  | { type: "DISMISS_ERROR" };

/** The confirmed (authoritative) status: the last entry in the history. */
export function confirmedStatus(state: TimelineState): EscrowStatus {
  return state.history[state.history.length - 1].status;
}

/** The status the UI should *show*: the optimistic target while an action is
    in flight, otherwise the confirmed status. */
export function effectiveStatus(state: TimelineState): EscrowStatus {
  return state.pending ? state.pending.targetStatus : confirmedStatus(state);
}

export function initialTimelineState(fundedAt: string, txHash: string | null = null): TimelineState {
  return {
    history: [{ status: "funded", action: null, at: fundedAt, txHash }],
    pending: null,
    error: null,
  };
}

function appendConfirmed(
  state: TimelineState,
  entry: ConfirmedEntry,
): TimelineState {
  return { history: [...state.history, entry], pending: null, error: null };
}

/**
 * Pure reducer. Every branch returns a new state (or the same reference for a
 * no-op), so callers can dispatch freely without pre-checking validity.
 */
export function timelineReducer(state: TimelineState, event: TimelineEvent): TimelineState {
  switch (event.type) {
    case "SUBMIT": {
      // Ignore a second submission while one is already in flight, and any
      // action that isn't legal from the current confirmed status.
      if (state.pending) return state;
      if (!actionsFor(confirmedStatus(state)).includes(event.action)) return state;
      return {
        ...state,
        error: null,
        pending: {
          action: event.action,
          targetStatus: ACTION_TARGET[event.action],
          submissionId: event.submissionId,
          at: event.at,
        },
      };
    }

    case "CONFIRMED": {
      // Only the currently in-flight submission can confirm; a stale
      // confirmation (already superseded by a SYNC) is ignored.
      if (!state.pending || state.pending.submissionId !== event.submissionId) return state;
      return appendConfirmed(state, {
        status: state.pending.targetStatus,
        action: state.pending.action,
        at: event.at,
        txHash: event.txHash,
      });
    }

    case "FAILED": {
      // Roll back: drop the optimistic node, keep the confirmed history, and
      // surface the reason so the UI can offer a retry.
      if (!state.pending || state.pending.submissionId !== event.submissionId) return state;
      return { ...state, pending: null, error: event.message };
    }

    case "SYNC": {
      const current = confirmedStatus(state);
      // Already reflected — nothing to do (idempotent poll).
      if (event.status === current) return state;

      // The poll observed the exact status our in-flight action targets: the
      // submission landed (possibly via a path other than our own CONFIRMED,
      // e.g. the confirmation callback was lost). Commit it.
      if (state.pending && event.status === state.pending.targetStatus) {
        return appendConfirmed(state, {
          status: state.pending.targetStatus,
          action: state.pending.action,
          at: event.at,
          txHash: event.txHash,
        });
      }

      // An authoritative change we didn't initiate (a counterparty acted, or a
      // dispute was resolved elsewhere). Adopt it only if it's a legal
      // successor of our confirmed status; drop any unrelated optimistic node,
      // since the chain has moved on without it.
      if (isLegalSuccessor(current, event.status)) {
        return {
          history: [
            ...state.history,
            { status: event.status, action: actionForTransition(current, event.status), at: event.at, txHash: event.txHash },
          ],
          pending: null,
          // A pending action that's now impossible was effectively rolled back
          // by the external change; note it so the UI can explain the snap-back.
          error: state.pending ? "The escrow status changed on-chain, so your action was cancelled." : null,
        };
      }

      // A status we can't reconcile (e.g. a non-adjacent jump) — ignore rather
      // than corrupt the history. A real integration would refetch fully here.
      return state;
    }

    case "DISMISS_ERROR":
      return state.error ? { ...state, error: null } : state;

    default:
      return state;
  }
}

/** Whether `to` is a directly reachable confirmed status from `from`. */
export function isLegalSuccessor(from: EscrowStatus, to: EscrowStatus): boolean {
  return actionsFor(from).some((action) => ACTION_TARGET[action] === to);
}

/** The action that produced a given transition, or null if none matches. */
function actionForTransition(from: EscrowStatus, to: EscrowStatus): EscrowAction | null {
  return actionsFor(from).find((action) => ACTION_TARGET[action] === to) ?? null;
}

export type TimelineNodePhase = "confirmed" | "optimistic";

export interface TimelineNode {
  status: EscrowStatus;
  label: string;
  description: string;
  phase: TimelineNodePhase;
  at: string;
  txHash: string | null;
  action: EscrowAction | null;
}

/** Flatten a `TimelineState` into the ordered nodes the timeline renders: the
    confirmed history followed by the optimistic pending node (if any). */
export function buildTimelineNodes(state: TimelineState): TimelineNode[] {
  const nodes: TimelineNode[] = state.history.map((entry) => ({
    status: entry.status,
    label: STATUS_LABELS[entry.status],
    description: STATUS_DESCRIPTIONS[entry.status],
    phase: "confirmed",
    at: entry.at,
    txHash: entry.txHash,
    action: entry.action,
  }));

  if (state.pending) {
    nodes.push({
      status: state.pending.targetStatus,
      label: STATUS_LABELS[state.pending.targetStatus],
      description: STATUS_DESCRIPTIONS[state.pending.targetStatus],
      phase: "optimistic",
      at: state.pending.at,
      txHash: null,
      action: state.pending.action,
    });
  }

  return nodes;
}
