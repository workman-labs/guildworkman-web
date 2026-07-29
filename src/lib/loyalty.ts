/**
 * Loyalty token types, mock data, and hook for the
 * GuildWorkman loyalty-rewards system.
 *
 * The actual Soroban contract integration is not yet deployed
 * (see README — Web3 / Stellar touches), so balances and
 * rewards are seeded in-memory. Once the contract lands, this
 * module is the single place to swap mock data for on-chain reads.
 */

import { useCallback, useMemo, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────

export interface LoyaltyReward {
  id: string;
  title: string;
  description: string;
  /** Token cost to redeem this reward. */
  cost: number;
  /** Emoji icon used in the reward card. */
  icon: string;
  category: "discount" | "service" | "feature";
}

export type RedemptionStep =
  | "browse"       // Default — browsing available rewards
  | "confirm"      // User picked a reward, asking for confirmation
  | "pending"      // Redemption is being processed
  | "success"      // Redemption completed
  | "error";       // Redemption failed

export interface RedemptionState {
  step: RedemptionStep;
  reward: LoyaltyReward | null;
  error?: string;
}

export interface LoyaltyState {
  /** Current token balance. */
  balance: number;
  /** Total tokens earned since account creation. */
  lifetimeEarned: number;
  /** Available rewards to redeem. */
  rewards: LoyaltyReward[];
  /** Current redemption flow state. */
  redemption: RedemptionState;
}

// ── Mock data ─────────────────────────────────────────────────────

const MOCK_REWARDS: LoyaltyReward[] = [
  {
    id: "reward-1",
    title: "10% Off Next Booking",
    description:
      "Get 10% off your next appointment with any skilled worker on the platform.",
    cost: 500,
    icon: "🎫",
    category: "discount",
  },
  {
    id: "reward-2",
    title: "Priority Scheduling",
    description:
      "Skip the queue — get priority booking for your next appointment.",
    cost: 800,
    icon: "⭐",
    category: "service",
  },
  {
    id: "reward-3",
    title: "Free Booking",
    description:
      "Redeem for a completely free booking with any worker of your choice.",
    cost: 1_200,
    icon: "🆓",
    category: "discount",
  },
  {
    id: "reward-4",
    title: "Worker Spotlight Badge",
    description:
      "Get a premium badge on your worker profile for 30 days, boosting visibility.",
    cost: 1_000,
    icon: "🏅",
    category: "feature",
  },
  {
    id: "reward-5",
    title: "Exclusive Early Access",
    description:
      "Be the first to try new features and book newly onboarded workers before anyone else.",
    cost: 600,
    icon: "🔓",
    category: "feature",
  },
  {
    id: "reward-6",
    title: "Double Loyalty Weekend",
    description:
      "Earn double loyalty tokens on all bookings made during the next weekend.",
    cost: 400,
    icon: "🔥",
    category: "service",
  },
];

const INITIAL_BALANCE = 1_850;
const INITIAL_LIFETIME = 4_200;

// ── Hook ──────────────────────────────────────────────────────────

export function useLoyalty() {
  const [state, setState] = useState<LoyaltyState>({
    balance: INITIAL_BALANCE,
    lifetimeEarned: INITIAL_LIFETIME,
    rewards: MOCK_REWARDS,
    redemption: { step: "browse", reward: null },
  });

  /** Start the redemption flow for a given reward. */
  const startRedemption = useCallback((reward: LoyaltyReward) => {
    setState((prev) => ({
      ...prev,
      redemption: { step: "confirm", reward },
    }));
  }, []);

  /** Confirm and process the redemption. */
  const confirmRedemption = useCallback(() => {
    setState((prev) => {
      const reward = prev.redemption.reward;
      if (!reward) return prev;
      if (prev.balance < reward.cost) {
        return {
          ...prev,
          redemption: { step: "error", reward, error: "Insufficient tokens." },
        };
      }
      return {
        ...prev,
        redemption: { step: "pending", reward },
      };
    });

    // Simulate async processing
    setTimeout(() => {
      setState((prev) => {
        const reward = prev.redemption.reward;
        if (!reward || prev.redemption.step !== "pending") return prev;
        return {
          ...prev,
          balance: prev.balance - reward.cost,
          redemption: { step: "success", reward },
        };
      });
    }, 2_000);
  }, []);

  /** Dismiss the redemption result and go back to browsing. */
  const dismissRedemption = useCallback(() => {
    setState((prev) => ({
      ...prev,
      redemption: { step: "browse", reward: null },
    }));
  }, []);

  /** Cancel the confirmation step and go back. */
  const cancelRedemption = useCallback(() => {
    setState((prev) => ({
      ...prev,
      redemption: { step: "browse", reward: null },
    }));
  }, []);

  const sortedRewards = useMemo(
    () => [...state.rewards].sort((a, b) => a.cost - b.cost),
    [state.rewards],
  );

  return {
    ...state,
    rewards: sortedRewards,
    startRedemption,
    confirmRedemption,
    dismissRedemption,
    cancelRedemption,
  };
}