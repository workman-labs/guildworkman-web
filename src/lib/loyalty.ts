/**
 * Loyalty redemption UI state. The backend does not yet expose the loyalty
 * contract, so `redeemReward` is an explicit preview adapter that can be
 * replaced without changing the drawer or its state transitions.
 */

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  cost: number;
}

export const LOYALTY_REWARDS: LoyaltyReward[] = [
  { id: "booking-credit", name: "Booking credit", description: "Take 10% off your next booking.", cost: 500 },
  { id: "priority-support", name: "Priority support", description: "Get priority help with your next request.", cost: 800 },
  { id: "fee-waiver", name: "Fee waiver", description: "Waive the platform fee on one completed booking.", cost: 1200 },
];

export type LoyaltyRedemptionStatus = "browsing" | "confirming" | "redeeming" | "success" | "failed";

export interface LoyaltyState {
  balance: number;
  selectedReward: LoyaltyReward | null;
  status: LoyaltyRedemptionStatus;
  reference: string | null;
  error: string | null;
}

export const initialLoyaltyState: LoyaltyState = {
  balance: 1240,
  selectedReward: null,
  status: "browsing",
  reference: null,
  error: null,
};

export type LoyaltyEvent =
  | { type: "SELECT"; reward: LoyaltyReward }
  | { type: "CANCEL" }
  | { type: "REDEEM_START" }
  | { type: "REDEEM_SUCCESS"; reference: string }
  | { type: "REDEEM_ERROR"; error: string }
  | { type: "DONE" };

export function canRedeem(balance: number, reward: LoyaltyReward): boolean {
  return balance >= reward.cost;
}

export function loyaltyReducer(state: LoyaltyState, event: LoyaltyEvent): LoyaltyState {
  switch (event.type) {
    case "SELECT":
      if (!canRedeem(state.balance, event.reward) || state.status === "redeeming") return state;
      return { ...state, selectedReward: event.reward, status: "confirming", error: null, reference: null };
    case "CANCEL":
      if (state.status !== "confirming" && state.status !== "failed") return state;
      return { ...state, selectedReward: null, status: "browsing", error: null };
    case "REDEEM_START":
      if (state.status !== "confirming" || !state.selectedReward) return state;
      return { ...state, status: "redeeming", error: null };
    case "REDEEM_SUCCESS":
      if (state.status !== "redeeming" || !state.selectedReward) return state;
      return {
        balance: state.balance - state.selectedReward.cost,
        selectedReward: state.selectedReward,
        status: "success",
        reference: event.reference,
        error: null,
      };
    case "REDEEM_ERROR":
      if (state.status !== "redeeming") return state;
      return { ...state, status: "failed", error: event.error };
    case "DONE":
      if (state.status !== "success") return state;
      return { ...state, selectedReward: null, status: "browsing", reference: null };
    default:
      return state;
  }
}

export async function redeemReward(reward: LoyaltyReward, walletAddress: string): Promise<{ reference: string }> {
  void reward;
  void walletAddress;
  await new Promise((resolve) => setTimeout(resolve, 800));
  return { reference: `LOY-${Date.now().toString(36).toUpperCase()}` };
}
