"use client";

import { useReducer, useCallback, useEffect, useRef } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Milestone {
  id: string;
  description: string;
  amount: number; // percentage of total escrow (0–100)
  dueDate: string; // ISO date string
}

export interface EscrowFormData {
  /** Amount to deposit in the escrow (in XLM / smallest unit). */
  amount: string;
  /** Recipient Stellar public key. */
  recipient: string;
  /** Optional memo for the escrow. */
  memo: string;
  /** Milestone schedule. */
  milestones: Milestone[];
}

export type WizardStep =
  | "funding"
  | "milestones"
  | "review"
  | "wallet"
  | "success";

export type WizardAction =
  | { type: "GO_TO"; step: WizardStep }
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "UPDATE_FUNDING"; payload: Partial<EscrowFormData> }
  | { type: "SET_MILESTONES"; payload: Milestone[] }
  | { type: "SUBMIT" }
  | { type: "RESET" }
  | { type: "RESTORE"; payload: { step: WizardStep; data: EscrowFormData } };

export interface WizardState {
  step: WizardStep;
  data: EscrowFormData;
  /** Used for screen-reader announcements. */
  announcement: string;
}

// ── Step order ──────────────────────────────────────────────────────────────────

const STEP_ORDER: WizardStep[] = ["funding", "milestones", "review", "wallet", "success"];

function nextStep(current: WizardStep): WizardStep | null {
  const idx = STEP_ORDER.indexOf(current);
  return idx < STEP_ORDER.length - 1 ? STEP_ORDER[idx + 1] : null;
}

function prevStep(current: WizardStep): WizardStep | null {
  const idx = STEP_ORDER.indexOf(current);
  return idx > 0 ? STEP_ORDER[idx - 1] : null;
}

// ── Step labels ─────────────────────────────────────────────────────────────────

export const STEP_LABELS: Record<WizardStep, string> = {
  funding: "Funding Details",
  milestones: "Milestone Schedule",
  review: "Review & Confirm",
  wallet: "Connect Wallet",
  success: "Complete",
};

// ── Reducer ─────────────────────────────────────────────────────────────────────

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "GO_TO":
      return {
        ...state,
        step: action.step,
        announcement: `Navigated to ${STEP_LABELS[action.step]}`,
      };

    case "NEXT": {
      const next = nextStep(state.step);
      if (!next) return state;
      return {
        ...state,
        step: next,
        announcement: `Moving to ${STEP_LABELS[next]}`,
      };
    }

    case "BACK": {
      const prev = prevStep(state.step);
      if (!prev) return state;
      return {
        ...state,
        step: prev,
        announcement: `Going back to ${STEP_LABELS[prev]}`,
      };
    }

    case "UPDATE_FUNDING":
      return {
        ...state,
        data: { ...state.data, ...action.payload },
      };

    case "SET_MILESTONES":
      return {
        ...state,
        data: { ...state.data, milestones: action.payload },
      };

    case "SUBMIT":
      return {
        ...state,
        step: "success",
        announcement: "Escrow funding submitted successfully",
      };

    case "RESET":
      return createInitialState();

    case "RESTORE":
      return {
        ...state,
        step: action.payload.step,
        data: action.payload.data,
        announcement: "Resuming from where you left off",
      };

    default:
      return state;
  }
}

// ── Initial state ───────────────────────────────────────────────────────────────

const STORAGE_KEY = "guildworkman-escrow-wizard";

function createInitialState(): WizardState {
  return {
    step: "funding",
    data: {
      amount: "",
      recipient: "",
      memo: "",
      milestones: [],
    },
    announcement: "",
  };
}

// ── Hook ────────────────────────────────────────────────────────────────────────

export function useEscrowWizard() {
  const [state, dispatch] = useReducer(wizardReducer, null, () => {
    // Try to restore from localStorage
    if (typeof window === "undefined") return createInitialState();
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { step: WizardStep; data: EscrowFormData };
        // Only restore if we're not on the last step
        if (parsed.step !== "success") {
          return wizardReducer(createInitialState(), {
            type: "RESTORE",
            payload: parsed,
          });
        }
      }
    } catch {
      // ignore corrupt data
    }
    return createInitialState();
  });

  const prevStepRef = useRef(state.step);

  // Persist to localStorage on every meaningful change (skip success & reset)
  useEffect(() => {
    if (state.step !== "success" && state.announcement !== "Resetting wizard") {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ step: state.step, data: state.data })
      );
    }
  }, [state.step, state.data]);

  // Clear localStorage on success or reset
  useEffect(() => {
    if (state.step === "success") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [state.step]);

  // Focus management: move focus to the step heading when step changes
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (prevStepRef.current !== state.step) {
      // Small delay for DOM to render
      const timer = setTimeout(() => {
        headingRef.current?.focus();
      }, 50);
      prevStepRef.current = state.step;
      return () => clearTimeout(timer);
    }
  }, [state.step]);

  const goTo = useCallback((step: WizardStep) => dispatch({ type: "GO_TO", step }), []);
  const next = useCallback(() => dispatch({ type: "NEXT" }), []);
  const back = useCallback(() => dispatch({ type: "BACK" }), []);
  const updateFunding = useCallback(
    (payload: Partial<EscrowFormData>) => dispatch({ type: "UPDATE_FUNDING", payload }),
    []
  );
  const setMilestones = useCallback(
    (payload: Milestone[]) => dispatch({ type: "SET_MILESTONES", payload }),
    []
  );
  const submit = useCallback(() => dispatch({ type: "SUBMIT" }), []);
  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    dispatch({ type: "RESET" });
  }, []);

  const totalStep = STEP_ORDER.length;
  const currentStepIndex = STEP_ORDER.indexOf(state.step) + 1;

  return {
    state,
    dispatch,
    goTo,
    next,
    back,
    updateFunding,
    setMilestones,
    submit,
    reset,
    headingRef,
    totalStep,
    currentStepIndex,
  };
}