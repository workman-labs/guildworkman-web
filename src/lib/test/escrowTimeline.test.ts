import { describe, expect, it } from "vitest";
import {
  ACTION_TARGET,
  actionsFor,
  buildTimelineNodes,
  confirmedStatus,
  effectiveStatus,
  initialTimelineState,
  isLegalSuccessor,
  timelineReducer,
  type TimelineState,
} from "../escrowTimeline";

const T0 = "2026-08-24T10:00:00.000Z";
const T1 = "2026-08-24T10:05:00.000Z";
const T2 = "2026-08-24T10:06:00.000Z";

function funded(): TimelineState {
  return initialTimelineState(T0);
}

/** Drive the reducer through funded → pending(release) so tests that start
    from an in-flight optimistic state don't repeat the setup. */
function submittedRelease(): { state: TimelineState; submissionId: string } {
  const submissionId = "sub-1";
  const state = timelineReducer(funded(), {
    type: "SUBMIT",
    action: "release",
    submissionId,
    at: T1,
  });
  return { state, submissionId };
}

describe("metadata", () => {
  it("lists the legal actions per status", () => {
    expect(actionsFor("funded")).toEqual(["release", "cancel", "dispute"]);
    expect(actionsFor("disputed")).toEqual(["resolve"]);
    expect(actionsFor("completed")).toEqual([]);
    expect(actionsFor("cancelled")).toEqual([]);
    expect(actionsFor("resolved")).toEqual([]);
  });

  it("maps each action to its resulting status", () => {
    expect(ACTION_TARGET.release).toBe("completed");
    expect(ACTION_TARGET.cancel).toBe("cancelled");
    expect(ACTION_TARGET.dispute).toBe("disputed");
    expect(ACTION_TARGET.resolve).toBe("resolved");
  });

  it("knows which transitions are legal successors", () => {
    expect(isLegalSuccessor("funded", "completed")).toBe(true);
    expect(isLegalSuccessor("funded", "disputed")).toBe(true);
    expect(isLegalSuccessor("disputed", "resolved")).toBe(true);
    expect(isLegalSuccessor("funded", "resolved")).toBe(false);
    expect(isLegalSuccessor("completed", "cancelled")).toBe(false);
  });
});

describe("initial state", () => {
  it("starts funded with a single history entry and no pending action", () => {
    const state = funded();
    expect(confirmedStatus(state)).toBe("funded");
    expect(effectiveStatus(state)).toBe("funded");
    expect(state.history).toHaveLength(1);
    expect(state.history[0]).toMatchObject({ status: "funded", action: null, txHash: null });
    expect(state.pending).toBeNull();
    expect(state.error).toBeNull();
  });
});

describe("SUBMIT (optimistic apply)", () => {
  it("applies a legal action optimistically without touching confirmed history", () => {
    const { state } = submittedRelease();
    expect(state.pending).toMatchObject({ action: "release", targetStatus: "completed" });
    expect(effectiveStatus(state)).toBe("completed"); // shown optimistically
    expect(confirmedStatus(state)).toBe("funded"); // but not yet confirmed
    expect(state.history).toHaveLength(1);
    expect(state.error).toBeNull();
  });

  it("ignores an action that isn't legal from the current status", () => {
    const state = funded();
    const next = timelineReducer(state, { type: "SUBMIT", action: "resolve", submissionId: "x", at: T1 });
    expect(next).toBe(state);
  });

  it("ignores a second submission while one is in flight", () => {
    const { state } = submittedRelease();
    const next = timelineReducer(state, { type: "SUBMIT", action: "cancel", submissionId: "sub-2", at: T2 });
    expect(next).toBe(state);
  });
});

describe("CONFIRMED", () => {
  it("commits the in-flight action to history and clears pending", () => {
    const { state, submissionId } = submittedRelease();
    const next = timelineReducer(state, { type: "CONFIRMED", submissionId, txHash: "abc123", at: T2 });

    expect(next.pending).toBeNull();
    expect(confirmedStatus(next)).toBe("completed");
    expect(next.history).toHaveLength(2);
    expect(next.history[1]).toMatchObject({ status: "completed", action: "release", txHash: "abc123", at: T2 });
  });

  it("ignores a confirmation whose submissionId doesn't match the in-flight one", () => {
    const { state } = submittedRelease();
    const next = timelineReducer(state, { type: "CONFIRMED", submissionId: "stale", txHash: "z", at: T2 });
    expect(next).toBe(state);
  });
});

describe("FAILED (graceful rollback)", () => {
  it("drops the optimistic node, keeps confirmed history, and surfaces the error", () => {
    const { state, submissionId } = submittedRelease();
    const next = timelineReducer(state, { type: "FAILED", submissionId, message: "network down" });

    expect(next.pending).toBeNull();
    expect(confirmedStatus(next)).toBe("funded"); // rolled back
    expect(effectiveStatus(next)).toBe("funded");
    expect(next.history).toHaveLength(1);
    expect(next.error).toBe("network down");
  });

  it("ignores a failure for a stale submission", () => {
    const { state } = submittedRelease();
    const next = timelineReducer(state, { type: "FAILED", submissionId: "stale", message: "x" });
    expect(next).toBe(state);
  });
});

describe("SYNC (real-time reconciliation)", () => {
  it("is a no-op when the polled status already matches", () => {
    const state = funded();
    const next = timelineReducer(state, { type: "SYNC", status: "funded", txHash: null, at: T1 });
    expect(next).toBe(state);
  });

  it("adopts an authoritative external change we didn't initiate", () => {
    const state = funded();
    const next = timelineReducer(state, { type: "SYNC", status: "disputed", txHash: "tx1", at: T1 });

    expect(confirmedStatus(next)).toBe("disputed");
    expect(next.history).toHaveLength(2);
    expect(next.history[1]).toMatchObject({ status: "disputed", action: "dispute", txHash: "tx1" });
    expect(next.pending).toBeNull();
  });

  it("confirms an in-flight action when the poll observes its target status", () => {
    const { state } = submittedRelease();
    const next = timelineReducer(state, { type: "SYNC", status: "completed", txHash: "tx2", at: T2 });

    expect(confirmedStatus(next)).toBe("completed");
    expect(next.history).toHaveLength(2);
    expect(next.history[1]).toMatchObject({ status: "completed", action: "release", txHash: "tx2" });
    expect(next.pending).toBeNull();
    expect(next.error).toBeNull();
  });

  it("lets an external change win over an unrelated in-flight action and notes the snap-back", () => {
    const { state } = submittedRelease(); // optimistically heading to "completed"
    const next = timelineReducer(state, { type: "SYNC", status: "disputed", txHash: "tx3", at: T2 });

    expect(confirmedStatus(next)).toBe("disputed");
    expect(next.pending).toBeNull();
    expect(next.error).toMatch(/changed on-chain/i);
  });

  it("ignores a status it can't reconcile as a legal successor", () => {
    const state = funded();
    const next = timelineReducer(state, { type: "SYNC", status: "resolved", txHash: "tx", at: T1 });
    expect(next).toBe(state);
  });
});

describe("DISMISS_ERROR", () => {
  it("clears a rolled-back error", () => {
    const { state, submissionId } = submittedRelease();
    const failed = timelineReducer(state, { type: "FAILED", submissionId, message: "boom" });
    const cleared = timelineReducer(failed, { type: "DISMISS_ERROR" });
    expect(cleared.error).toBeNull();
  });

  it("is a no-op when there's no error", () => {
    const state = funded();
    expect(timelineReducer(state, { type: "DISMISS_ERROR" })).toBe(state);
  });
});

describe("buildTimelineNodes", () => {
  it("renders one node per confirmed entry", () => {
    const nodes = buildTimelineNodes(funded());
    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({ status: "funded", phase: "confirmed" });
  });

  it("appends an optimistic node while an action is in flight", () => {
    const { state } = submittedRelease();
    const nodes = buildTimelineNodes(state);
    expect(nodes).toHaveLength(2);
    expect(nodes[0].phase).toBe("confirmed");
    expect(nodes[1]).toMatchObject({ status: "completed", phase: "optimistic", action: "release", txHash: null });
  });
});

describe("full lifecycle paths", () => {
  it("walks funded → release → completed (terminal)", () => {
    let state = funded();
    state = timelineReducer(state, { type: "SUBMIT", action: "release", submissionId: "s", at: T1 });
    state = timelineReducer(state, { type: "CONFIRMED", submissionId: "s", txHash: "h", at: T2 });
    expect(confirmedStatus(state)).toBe("completed");
    expect(actionsFor(confirmedStatus(state))).toEqual([]);
  });

  it("walks funded → dispute → resolve", () => {
    let state = funded();
    state = timelineReducer(state, { type: "SUBMIT", action: "dispute", submissionId: "s1", at: T1 });
    state = timelineReducer(state, { type: "CONFIRMED", submissionId: "s1", txHash: "h1", at: T1 });
    expect(confirmedStatus(state)).toBe("disputed");

    state = timelineReducer(state, { type: "SUBMIT", action: "resolve", submissionId: "s2", at: T2 });
    state = timelineReducer(state, { type: "CONFIRMED", submissionId: "s2", txHash: "h2", at: T2 });
    expect(confirmedStatus(state)).toBe("resolved");
    expect(state.history.map((h) => h.status)).toEqual(["funded", "disputed", "resolved"]);
  });
});
