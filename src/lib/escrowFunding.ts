/**
 * Escrow funding wizard — explicit finite state machine, save-and-resume
 * persistence, and the funding call.
 *
 * WHY AN EXPLICIT STATE MACHINE
 * The wizard has real branching (wallet not connected, funding can fail and
 * be retried, a step can only be reached once its predecessor succeeds) that
 * a bare `stepIndex` counter can't express safely — it's easy to end up with
 * a UI showing "funding…" while state actually says "failed", or to let a
 * user "continue" past a step that never completed. Modeling it as a
 * transition table instead means every reachable (state, event) pair is
 * enumerated once here, `transition()` is a pure function the UI/tests can
 * drive directly, and invalid transitions (e.g. FUND_SUCCESS from Review)
 * are simply absent from the table rather than a runtime state that has to
 * be special-cased everywhere.
 *
 * WHY THIS IS A FRONTEND-ONLY STUB (read before wiring a real endpoint)
 * `guildworkman-core`'s Soroban `escrow` contract isn't called from the
 * backend yet (see the README's "Web3 / Stellar touches" section and the
 * NOTE in `BookingScreen.tsx`) — there's no REST or RPC endpoint today that
 * actually locks funds on-chain. Rather than invent a shape the backend
 * can't answer, `fundEscrow` below simulates the round trip (latency + a
 * success/failure outcome) so the wizard's state transitions, save-and-
 * resume, and error-recovery UI are fully exercised today. Swap its body for
 * a real call once the backend/contract integration lands — the wizard
 * component doesn't need to change, only this function's implementation.
 */

export type EscrowStateName =
  | "review"
  | "connectWallet"
  | "confirm"
  | "funding"
  | "funded"
  | "failed";

export interface EscrowFundingContext {
  bookingRef: string;
  amount: number;
  workerName: string;
  /** Set once a wallet has been connected (stubbed — see lib/wallet.ts). */
  walletAddress: string | null;
  /** Populated on FUND_ERROR so the Confirm step can show a retry with context. */
  errorMessage: string | null;
  /** Populated on FUND_SUCCESS. */
  escrowReference: string | null;
}

export interface EscrowState {
  name: EscrowStateName;
  context: EscrowFundingContext;
}

export type EscrowEvent =
  | { type: "CONTINUE" }
  | { type: "BACK" }
  | { type: "WALLET_CONNECTED"; address: string }
  | { type: "FUND_START" }
  | { type: "FUND_SUCCESS"; escrowReference: string }
  | { type: "FUND_ERROR"; message: string }
  | { type: "RETRY" }
  | { type: "RESTART" };

export const STATE_ORDER: EscrowStateName[] = [
  "review",
  "connectWallet",
  "confirm",
  "funding",
  "funded",
];

export const STATE_LABELS: Record<EscrowStateName, string> = {
  review: "Review",
  connectWallet: "Connect wallet",
  confirm: "Confirm & fund",
  funding: "Funding escrow",
  funded: "Funded",
  failed: "Funding failed",
};

/** Human-readable sentence announced to screen readers (via an `aria-live`
    region) on every transition — written to name the state a user has
    *arrived at*, not the event that caused it, since that's what someone
    listening needs to know next. */
export const STATE_ANNOUNCEMENTS: Record<EscrowStateName, string> = {
  review: "Step 1 of 4: Review booking details.",
  connectWallet: "Step 2 of 4: Connect your Stellar wallet.",
  confirm: "Step 3 of 4: Confirm the amount and fund escrow.",
  funding: "Funding escrow, please wait.",
  funded: "Escrow funded successfully. Your payment is now held in escrow.",
  failed: "Funding failed. You can retry or go back to review your details.",
};

/** Pure state transition table. Returns the same state object (no-op) for
    any event not valid in the current state, so callers can dispatch freely
    without pre-checking validity. */
export function transition(state: EscrowState, event: EscrowEvent): EscrowState {
  const { name, context } = state;

  switch (name) {
    case "review":
      if (event.type === "CONTINUE") {
        return { name: "connectWallet", context };
      }
      break;

    case "connectWallet":
      if (event.type === "WALLET_CONNECTED") {
        return {
          name: "confirm",
          context: { ...context, walletAddress: event.address },
        };
      }
      if (event.type === "BACK") {
        return { name: "review", context };
      }
      break;

    case "confirm":
      if (event.type === "FUND_START") {
        return { name: "funding", context: { ...context, errorMessage: null } };
      }
      if (event.type === "BACK") {
        return { name: "connectWallet", context };
      }
      break;

    case "funding":
      if (event.type === "FUND_SUCCESS") {
        return {
          name: "funded",
          context: { ...context, escrowReference: event.escrowReference, errorMessage: null },
        };
      }
      if (event.type === "FUND_ERROR") {
        return { name: "failed", context: { ...context, errorMessage: event.message } };
      }
      break;

    case "failed":
      if (event.type === "RETRY") {
        return { name: "confirm", context: { ...context, errorMessage: null } };
      }
      if (event.type === "RESTART") {
        return { name: "review", context: { ...context, errorMessage: null } };
      }
      break;

    case "funded":
      break;
  }

  return state;
}

/** Index into STATE_ORDER for progress display; "failed" maps to the
    "confirm" step it can retry from, since it isn't a step of its own. */
export function progressIndex(name: EscrowStateName): number {
  if (name === "failed") return STATE_ORDER.indexOf("confirm");
  return STATE_ORDER.indexOf(name);
}

export function initialEscrowState(context: EscrowFundingContext): EscrowState {
  return { name: "review", context };
}

const STORAGE_KEY_PREFIX = "gw-escrow-funding-v1:";

export interface PersistedEscrowState {
  name: EscrowStateName;
  context: EscrowFundingContext;
  savedAt: string;
}

function storageKey(bookingRef: string): string {
  return `${STORAGE_KEY_PREFIX}${bookingRef}`;
}

/** Terminal/transient states are never persisted: "funding" can't be resumed
    mid-flight (there's nothing to reconnect to), and "funded" has nothing
    left to resume — the wizard just clears storage on success. */
const RESUMABLE_STATES: EscrowStateName[] = ["review", "connectWallet", "confirm", "failed"];

export function saveEscrowProgress(state: EscrowState): void {
  if (typeof window === "undefined") return;
  if (!RESUMABLE_STATES.includes(state.name)) return;
  const record: PersistedEscrowState = {
    name: state.name,
    context: state.context,
    savedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(storageKey(state.context.bookingRef), JSON.stringify(record));
  } catch {
    // Quota exceeded or storage disabled — resume just won't be available.
  }
}

export function loadEscrowProgress(bookingRef: string): PersistedEscrowState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(bookingRef));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedEscrowState;
    if (!RESUMABLE_STATES.includes(parsed.name)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearEscrowProgress(bookingRef: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(storageKey(bookingRef));
}

export interface FundEscrowResult {
  escrowReference: string;
}

/** Simulated funding call — see the module doc comment for why this doesn't
    call a real contract yet. Fails roughly 1 in 6 tries so the wizard's
    error-recovery path (inline error + retry, context left intact) is
    reachable without special test hooks. */
export function fundEscrow(context: EscrowFundingContext): Promise<FundEscrowResult> {
  void context; // not sent anywhere yet — see module doc comment
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 1 / 6) {
        reject(new Error("We couldn't reach the escrow service. Please try again."));
        return;
      }
      resolve({ escrowReference: `ESC-${Date.now().toString(36).toUpperCase()}` });
    }, 1200);
  });
}
