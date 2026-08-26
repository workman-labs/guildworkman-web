"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { HiGift, HiX } from "react-icons/hi";
import { useNotifications } from "@/components/notifications/useNotifications";
import { useWallet } from "@/components/wallet/WalletProvider";
import { errorNotification, pendingNotification, successNotification } from "@/lib/notifications";
import {
  canRedeem,
  initialLoyaltyState,
  LOYALTY_REWARDS,
  loyaltyReducer,
  redeemReward,
} from "@/lib/loyalty";
import Button, { buttonClasses } from "@/components/ui/Button";

const FOCUSABLE = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

export default function LoyaltyDrawer() {
  const [open, setOpen] = useState(false);
  const [state, dispatch] = useReducer(loyaltyReducer, initialLoyaltyState);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { address, isWrongNetwork } = useWallet();
  const { addNotification } = useNotifications();

  const close = () => {
    if (state.status === "redeeming") return;
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (state.status !== "redeeming") setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [open, state.status]);

  const redeem = async () => {
    if (!state.selectedReward || !address || isWrongNetwork) return;
    dispatch({ type: "REDEEM_START" });
    addNotification(pendingNotification("Redeeming reward", "Your reward redemption is being processed."));
    try {
      const result = await redeemReward(state.selectedReward, address);
      dispatch({ type: "REDEEM_SUCCESS", reference: result.reference });
      addNotification(successNotification("Reward redeemed", `${state.selectedReward.name} is ready to use.`));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to redeem this reward. Please try again.";
      dispatch({ type: "REDEEM_ERROR", error: message });
      addNotification(errorNotification("Redemption failed", message));
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className={buttonClasses("ghost", "sm", "px-3")}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <HiGift className="text-lg text-gold-deep" aria-hidden="true" />
        <span className="hidden lg:inline">Rewards</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-[60]">
          <button type="button" className="absolute inset-0 cursor-default bg-navy-ink/45" aria-label="Close rewards drawer" onClick={close} />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="loyalty-title"
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-surface shadow-float"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-deep">Guild rewards</p>
                <h2 id="loyalty-title" className="mt-1 text-xl font-bold text-ink">Your loyalty balance</h2>
              </div>
              <button type="button" onClick={close} className="rounded-lg p-2 text-muted hover:bg-sand" aria-label="Close rewards drawer">
                <HiX className="text-2xl" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="rounded-2xl bg-navy p-5 text-white">
                <p className="text-sm text-white/70">Available Guild Tokens</p>
                <p className="mt-1 text-4xl font-bold">{state.balance.toLocaleString()} <span className="text-lg text-gold-2">GWT</span></p>
                <p className="mt-3 text-xs text-white/65">Preview balance. Live token data will be connected when the loyalty API is available.</p>
              </div>

              {state.status === "browsing" ? (
                <div className="mt-7">
                  <h3 className="font-bold text-ink">Redeem rewards</h3>
                  <div className="mt-3 space-y-3">
                    {LOYALTY_REWARDS.map((reward) => {
                      const affordable = canRedeem(state.balance, reward);
                      return <button key={reward.id} type="button" disabled={!affordable} onClick={() => dispatch({ type: "SELECT", reward })} className="w-full rounded-xl border border-line p-4 text-left transition hover:border-gold disabled:cursor-not-allowed disabled:opacity-50">
                        <div className="flex justify-between gap-4"><span className="font-semibold text-ink">{reward.name}</span><span className="shrink-0 font-bold text-gold-deep">{reward.cost} GWT</span></div>
                        <p className="mt-1 text-sm text-muted">{reward.description}</p>
                        {!affordable ? <p className="mt-2 text-xs font-semibold text-err">Need {(reward.cost - state.balance).toLocaleString()} more GWT</p> : null}
                      </button>;
                    })}
                  </div>
                </div>
              ) : null}

              {state.status === "confirming" && state.selectedReward ? <Confirmation rewardName={state.selectedReward.name} cost={state.selectedReward.cost} blocked={!address || isWrongNetwork} blockedMessage={!address ? "Connect your wallet to redeem rewards." : "Switch to the required Stellar network to redeem."} onCancel={() => dispatch({ type: "CANCEL" })} onConfirm={redeem} /> : null}
              {state.status === "redeeming" ? <Status title="Redeeming your reward" detail="Please keep this drawer open while we confirm your redemption." /> : null}
              {state.status === "success" && state.selectedReward ? <Status title="Reward redeemed" detail={`${state.selectedReward.name} was redeemed. Reference: ${state.reference}`} actionLabel="Done" onAction={() => dispatch({ type: "DONE" })} /> : null}
              {state.status === "failed" ? <Status title="Redemption failed" detail={state.error ?? "Please try again."} error actionLabel="Back to rewards" onAction={() => dispatch({ type: "CANCEL" })} /> : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Confirmation({ rewardName, cost, blocked, blockedMessage, onCancel, onConfirm }: { rewardName: string; cost: number; blocked: boolean; blockedMessage: string; onCancel: () => void; onConfirm: () => void }) {
  return <div className="mt-7 rounded-2xl border border-gold/60 bg-sand p-5"><h3 className="text-lg font-bold text-ink">Confirm redemption</h3><p className="mt-2 text-sm text-muted">Redeem <strong className="text-ink">{cost} GWT</strong> for {rewardName}?</p>{blocked ? <p className="mt-3 text-sm font-medium text-err">{blockedMessage}</p> : null}<div className="mt-5 flex gap-3"><Button variant="outline" onClick={onCancel}>Cancel</Button><Button variant="gold" disabled={blocked} onClick={onConfirm}>Redeem reward</Button></div></div>;
}

function Status({ title, detail, error = false, actionLabel, onAction }: { title: string; detail: string; error?: boolean; actionLabel?: string; onAction?: () => void }) {
  return <div className={`mt-7 rounded-2xl border p-5 ${error ? "border-err/40 bg-err/5" : "border-ok/40 bg-ok/5"}`} aria-live="polite"><h3 className={`text-lg font-bold ${error ? "text-err" : "text-ok"}`}>{title}</h3><p className="mt-2 text-sm text-muted">{detail}</p>{actionLabel && onAction ? <Button className="mt-5" variant={error ? "outline" : "primary"} onClick={onAction}>{actionLabel}</Button> : null}</div>;
}
