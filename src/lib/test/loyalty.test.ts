import { describe, expect, it } from "vitest";
import { LOYALTY_REWARDS, initialLoyaltyState, loyaltyReducer } from "../loyalty";

describe("loyaltyReducer", () => {
  const reward = LOYALTY_REWARDS[0];

  it("moves through confirmation, pending, and success while updating the balance", () => {
    const confirming = loyaltyReducer(initialLoyaltyState, { type: "SELECT", reward });
    const redeeming = loyaltyReducer(confirming, { type: "REDEEM_START" });
    const success = loyaltyReducer(redeeming, { type: "REDEEM_SUCCESS", reference: "LOY-1" });

    expect(confirming.status).toBe("confirming");
    expect(redeeming.status).toBe("redeeming");
    expect(success).toMatchObject({ status: "success", balance: 740, reference: "LOY-1" });
  });

  it("does not let an unaffordable reward enter confirmation", () => {
    const state = loyaltyReducer({ ...initialLoyaltyState, balance: 100 }, {
      type: "SELECT",
      reward,
    });

    expect(state).toEqual({ ...initialLoyaltyState, balance: 100 });
  });

  it("retains an error for retry and does not deduct points on failure", () => {
    const confirming = loyaltyReducer(initialLoyaltyState, { type: "SELECT", reward });
    const redeeming = loyaltyReducer(confirming, { type: "REDEEM_START" });
    const failed = loyaltyReducer(redeeming, { type: "REDEEM_ERROR", error: "Service unavailable" });

    expect(failed).toMatchObject({ status: "failed", balance: 1240, error: "Service unavailable" });
    expect(loyaltyReducer(failed, { type: "CANCEL" }).status).toBe("browsing");
  });
});
