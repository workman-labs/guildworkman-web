import { beforeEach, describe, expect, it } from "vitest";
import {
  STATE_ORDER,
  clearEscrowProgress,
  initialEscrowState,
  loadEscrowProgress,
  progressIndex,
  saveEscrowProgress,
  transition,
  type EscrowFundingContext,
  type EscrowState,
} from "../escrowFunding";

const baseContext: EscrowFundingContext = {
  bookingRef: "GW-1234",
  amount: 8800,
  workerName: "Chidi O.",
  walletAddress: null,
  errorMessage: null,
  escrowReference: null,
};

function freshState(): EscrowState {
  return initialEscrowState(baseContext);
}

describe("transition", () => {
  it("starts in review", () => {
    expect(freshState().name).toBe("review");
  });

  it("walks the happy path from review to funded", () => {
    let state = freshState();
    state = transition(state, { type: "CONTINUE" });
    expect(state.name).toBe("connectWallet");

    state = transition(state, { type: "WALLET_CONNECTED", address: "GABC...WXYZ" });
    expect(state.name).toBe("confirm");
    expect(state.context.walletAddress).toBe("GABC...WXYZ");

    state = transition(state, { type: "FUND_START" });
    expect(state.name).toBe("funding");

    state = transition(state, { type: "FUND_SUCCESS", escrowReference: "ESC-1" });
    expect(state.name).toBe("funded");
    expect(state.context.escrowReference).toBe("ESC-1");
  });

  it("moves to failed on FUND_ERROR and preserves the message", () => {
    let state = freshState();
    state = transition(state, { type: "CONTINUE" });
    state = transition(state, { type: "WALLET_CONNECTED", address: "GABC...WXYZ" });
    state = transition(state, { type: "FUND_START" });
    state = transition(state, { type: "FUND_ERROR", message: "network down" });

    expect(state.name).toBe("failed");
    expect(state.context.errorMessage).toBe("network down");
  });

  it("RETRY from failed returns to confirm and clears the error", () => {
    const failed: EscrowState = {
      name: "failed",
      context: { ...baseContext, errorMessage: "boom" },
    };
    const state = transition(failed, { type: "RETRY" });
    expect(state.name).toBe("confirm");
    expect(state.context.errorMessage).toBeNull();
  });

  it("RESTART from failed returns to review and clears the error", () => {
    const failed: EscrowState = {
      name: "failed",
      context: { ...baseContext, errorMessage: "boom" },
    };
    const state = transition(failed, { type: "RESTART" });
    expect(state.name).toBe("review");
    expect(state.context.errorMessage).toBeNull();
  });

  it("BACK moves confirm to connectWallet and connectWallet to review", () => {
    const confirm: EscrowState = { name: "confirm", context: baseContext };
    expect(transition(confirm, { type: "BACK" }).name).toBe("connectWallet");

    const connectWallet: EscrowState = { name: "connectWallet", context: baseContext };
    expect(transition(connectWallet, { type: "BACK" }).name).toBe("review");
  });

  it("ignores events that aren't valid for the current state", () => {
    const state = freshState();
    const next = transition(state, { type: "FUND_SUCCESS", escrowReference: "ESC-1" });
    expect(next).toBe(state);
  });

  it("funded is terminal — no event moves it elsewhere", () => {
    const funded: EscrowState = {
      name: "funded",
      context: { ...baseContext, escrowReference: "ESC-1" },
    };
    expect(transition(funded, { type: "CONTINUE" })).toBe(funded);
    expect(transition(funded, { type: "BACK" })).toBe(funded);
  });
});

describe("progressIndex", () => {
  it("matches STATE_ORDER for step states", () => {
    expect(progressIndex("review")).toBe(STATE_ORDER.indexOf("review"));
    expect(progressIndex("funded")).toBe(STATE_ORDER.indexOf("funded"));
  });

  it("maps failed back onto the confirm step", () => {
    expect(progressIndex("failed")).toBe(STATE_ORDER.indexOf("confirm"));
  });
});

describe("saveEscrowProgress / loadEscrowProgress / clearEscrowProgress", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns null when nothing has been saved", () => {
    expect(loadEscrowProgress(baseContext.bookingRef)).toBeNull();
  });

  it("round-trips a resumable state", () => {
    const state: EscrowState = { name: "confirm", context: baseContext };
    saveEscrowProgress(state);

    const loaded = loadEscrowProgress(baseContext.bookingRef);
    expect(loaded?.name).toBe("confirm");
    expect(loaded?.context.bookingRef).toBe(baseContext.bookingRef);
    expect(loaded?.savedAt).toBeTruthy();
  });

  it("does not persist the funding state", () => {
    saveEscrowProgress({ name: "funding", context: baseContext });
    expect(loadEscrowProgress(baseContext.bookingRef)).toBeNull();
  });

  it("does not persist the funded state", () => {
    saveEscrowProgress({ name: "funded", context: baseContext });
    expect(loadEscrowProgress(baseContext.bookingRef)).toBeNull();
  });

  it("keeps separate progress per booking reference", () => {
    saveEscrowProgress({ name: "review", context: { ...baseContext, bookingRef: "GW-AAAA" } });
    saveEscrowProgress({ name: "confirm", context: { ...baseContext, bookingRef: "GW-BBBB" } });

    expect(loadEscrowProgress("GW-AAAA")?.name).toBe("review");
    expect(loadEscrowProgress("GW-BBBB")?.name).toBe("confirm");
  });

  it("clears a saved session", () => {
    saveEscrowProgress({ name: "review", context: baseContext });
    expect(loadEscrowProgress(baseContext.bookingRef)).not.toBeNull();
    clearEscrowProgress(baseContext.bookingRef);
    expect(loadEscrowProgress(baseContext.bookingRef)).toBeNull();
  });

  it("recovers gracefully from corrupted storage", () => {
    window.localStorage.setItem(`gw-escrow-funding-v1:${baseContext.bookingRef}`, "{not-json");
    expect(loadEscrowProgress(baseContext.bookingRef)).toBeNull();
  });
});
