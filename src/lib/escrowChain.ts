/**
 * Simulated on-chain escrow source for the status timeline.
 *
 * This is the *only* impure part of the timeline feature — it stands in for the
 * calls that will eventually hit `guildworkman-core`'s Soroban `escrow`
 * contract (or a backend RPC in front of it). It's kept out of
 * `escrowTimeline.ts` on purpose so the reducer there stays a pure, singleton-
 * free function the tests can trust. See the module doc comment in
 * `escrowTimeline.ts` (and the funding stub in `escrowFunding.ts`) for why the
 * web app simulates rather than calls the contract today.
 *
 * The in-memory `ledger` behaves like the authoritative chain: `submitAction`
 * mutates it after a realistic delay (and occasionally fails, so the rollback
 * path is reachable), and `fetchStatus` reads it — which is what lets the
 * polling hook observe both our own confirmed actions and, in principle, a
 * status a counterparty advanced. Swap these two functions' bodies for real
 * network calls and nothing else in the feature changes.
 */

import { ACTION_TARGET, type EscrowAction, type EscrowStatus } from "./escrowTimeline";

export interface ChainStatus {
  status: EscrowStatus;
  txHash: string | null;
  /** ISO-8601 timestamp of the observation. */
  at: string;
}

const SUBMIT_LATENCY_MS = 1400;
/** Roughly 1 submission in 6 fails, so the optimistic rollback path is
    exercised in normal use without special test hooks. */
const SUBMIT_FAILURE_RATE = 1 / 6;

interface LedgerRecord {
  status: EscrowStatus;
  txHash: string | null;
  at: string;
}

const ledger = new Map<string, LedgerRecord>();

function ensure(bookingRef: string): LedgerRecord {
  let record = ledger.get(bookingRef);
  if (!record) {
    record = { status: "funded", txHash: null, at: new Date().toISOString() };
    ledger.set(bookingRef, record);
  }
  return record;
}

function randomTxHash(): string {
  // A Stellar tx hash is 64 hex chars; this only needs to look the part.
  const hex = "0123456789abcdef";
  let out = "";
  for (let i = 0; i < 64; i += 1) out += hex[Math.floor(Math.random() * 16)];
  return out;
}

/** Poll the authoritative escrow status. Resolves quickly — a read, not a
    transaction. */
export function fetchStatus(bookingRef: string): Promise<ChainStatus> {
  const record = ensure(bookingRef);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ status: record.status, txHash: record.txHash, at: new Date().toISOString() });
    }, 120);
  });
}

/** Submit a state-changing escrow action. Resolves with the new confirmed
    status on success, or rejects (leaving the ledger unchanged) on failure. */
export function submitAction(bookingRef: string, action: EscrowAction): Promise<ChainStatus> {
  const record = ensure(bookingRef);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < SUBMIT_FAILURE_RATE) {
        reject(new Error("The escrow transaction couldn't be submitted. Please try again."));
        return;
      }
      record.status = ACTION_TARGET[action];
      record.txHash = randomTxHash();
      record.at = new Date().toISOString();
      resolve({ status: record.status, txHash: record.txHash, at: record.at });
    }, SUBMIT_LATENCY_MS);
  });
}

/** Test/support hook — reset a booking's simulated ledger entry. */
export function resetLedger(bookingRef?: string): void {
  if (bookingRef) ledger.delete(bookingRef);
  else ledger.clear();
}
