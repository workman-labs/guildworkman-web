"use client";

import { useEffect, useRef, useState } from "react";
import {
  HiGift,
  HiX,
  HiCheckCircle,
  HiExclamationCircle,
  HiArrowLeft,
  HiSparkles,
  HiCurrencyDollar,
  HiClock,
} from "react-icons/hi";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import type { LoyaltyReward, RedemptionStep } from "@/lib/loyalty";
import { useLoyalty } from "@/lib/loyalty";

// ── Token balance display ─────────────────────────────────────────

function BalanceBadge({ balance }: { balance: number }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-3 py-1.5">
      <HiCurrencyDollar aria-hidden className="text-sm text-gold-deep" />
      <span className="text-sm font-bold text-gold-deep">
        {balance.toLocaleString()}
      </span>
      <span className="text-[11px] font-medium text-gold-deep/70">tokens</span>
    </div>
  );
}

// ── Reward card ───────────────────────────────────────────────────

function RewardCard({
  reward,
  balance,
  onRedeem,
}: {
  reward: LoyaltyReward;
  balance: number;
  onRedeem: (r: LoyaltyReward) => void;
}) {
  const canAfford = balance >= reward.cost;
  const categoryLabel = {
    discount: "Discount",
    service: "Service",
    feature: "Feature",
  }[reward.category];

  return (
    <Card
      className={`flex items-start gap-4 p-4 transition-all ${
        canAfford
          ? "hover:border-gold/40 hover:shadow-float"
          : "opacity-60"
      }`}
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-tint text-lg"
        aria-hidden
      >
        {reward.icon}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-ink">{reward.title}</h4>
          <Badge tone="gold" className="shrink-0">
            {reward.cost.toLocaleString()} tokens
          </Badge>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          {reward.description}
        </p>
        <span className="mt-1.5 inline-block text-[10px] font-medium uppercase tracking-wider text-muted">
          {categoryLabel}
        </span>
      </div>

      <Button
        variant={canAfford ? "gold" : "ghost"}
        size="sm"
        disabled={!canAfford}
        onClick={() => onRedeem(reward)}
        className="shrink-0"
      >
        {canAfford ? "Redeem" : "—"}
      </Button>
    </Card>
  );
}

// ── Confirmation step ─────────────────────────────────────────────

function ConfirmStep({
  reward,
  balance,
  onConfirm,
  onCancel,
}: {
  reward: LoyaltyReward;
  balance: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const remaining = balance - reward.cost;

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="text-center">
        <span className="text-4xl" aria-hidden>
          {reward.icon}
        </span>
        <h3 className="mt-3 text-lg font-bold text-ink">{reward.title}</h3>
        <p className="mt-1 text-sm text-muted">{reward.description}</p>
      </div>

      <div className="rounded-xl border border-line bg-sand-2/50 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Current balance</span>
          <span className="font-semibold text-ink">
            {balance.toLocaleString()} tokens
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-muted">Cost</span>
          <span className="font-semibold text-err">
            −{reward.cost.toLocaleString()} tokens
          </span>
        </div>
        <div className="mt-2 border-t border-line pt-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-ink">Remaining</span>
            <span className="font-bold text-ink">
              {remaining.toLocaleString()} tokens
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button variant="gold" size="lg" onClick={onConfirm} className="w-full">
          <HiCheckCircle aria-hidden className="text-lg" />
          Confirm Redemption
        </Button>
        <Button variant="ghost" size="md" onClick={onCancel} className="w-full">
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ── Pending step ──────────────────────────────────────────────────

function PendingStep() {
  return (
    <div className="flex flex-col items-center gap-4 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/20">
        <HiClock aria-hidden className="text-3xl text-gold-deep animate-pulse" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-ink">Processing Redemption</h3>
        <p className="mt-1 text-sm text-muted">
          Your reward is being processed on the Stellar network. This should
          only take a moment.
        </p>
      </div>
      <div className="mt-2 flex gap-1.5">
        <span className="h-2 w-2 animate-bounce rounded-full bg-gold-deep" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-gold-deep [animation-delay:0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-gold-deep [animation-delay:0.3s]" />
      </div>
    </div>
  );
}

// ── Success step ──────────────────────────────────────────────────

function SuccessStep({
  reward,
  onDismiss,
}: {
  reward: LoyaltyReward;
  onDismiss: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ok/12">
        <HiSparkles aria-hidden className="text-3xl text-ok" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-ink">Redemption Successful!</h3>
        <p className="mt-1 text-sm text-muted">
          You&apos;ve successfully redeemed{" "}
          <strong className="text-ink">{reward.title}</strong>.
          {reward.category === "discount" &&
            " The discount will be applied to your next booking."}
          {reward.category === "service" &&
            " The service upgrade is now active on your account."}
          {reward.category === "feature" &&
            " The feature has been unlocked on your account."}
        </p>
      </div>
      <Button variant="primary" size="lg" onClick={onDismiss} className="mt-2">
        <HiGift aria-hidden className="text-lg" />
        Browse More Rewards
      </Button>
    </div>
  );
}

// ── Error step ────────────────────────────────────────────────────

function ErrorStep({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-err/12">
        <HiExclamationCircle aria-hidden className="text-3xl text-err" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-ink">Redemption Failed</h3>
        <p className="mt-1 text-sm text-muted">{message}</p>
      </div>
      <Button variant="primary" size="lg" onClick={onDismiss} className="mt-2">
        Go Back
      </Button>
    </div>
  );
}

// ── Browse view (reward list) ─────────────────────────────────────

function BrowseView({
  balance,
  lifetimeEarned,
  rewards,
  onRedeem,
}: {
  balance: number;
  lifetimeEarned: number;
  rewards: LoyaltyReward[];
  onRedeem: (r: LoyaltyReward) => void;
}) {
  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Stats row */}
      <div className="flex items-center gap-3">
        <BalanceBadge balance={balance} />
        <span className="text-xs text-muted">
          {lifetimeEarned.toLocaleString()} earned lifetime
        </span>
      </div>

      {/* Info banner */}
      <div className="rounded-xl border border-line bg-navy-tint/50 p-3 text-xs leading-relaxed text-navy-2">
        <strong className="block text-sm font-semibold text-ink">
          How Loyalty Tokens Work
        </strong>
        Earn tokens every time you complete a booking. Redeem them for
        discounts, service upgrades, and exclusive features. Tokens are tracked
        on the Stellar network — secure and transparent.
      </div>

      {/* Reward list */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-ink">Available Rewards</h3>
        {rewards.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted">
            No rewards available right now. Check back soon!
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {rewards.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                balance={balance}
                onRedeem={onRedeem}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Drawer content router ─────────────────────────────────────────

function DrawerContent({
  step,
  reward,
  balance,
  lifetimeEarned,
  rewards,
  error,
  onRedeem,
  onConfirm,
  onCancel,
  onDismiss,
}: {
  step: RedemptionStep;
  reward: LoyaltyReward | null;
  balance: number;
  lifetimeEarned: number;
  rewards: LoyaltyReward[];
  error?: string;
  onRedeem: (r: LoyaltyReward) => void;
  onConfirm: () => void;
  onCancel: () => void;
  onDismiss: () => void;
}) {
  switch (step) {
    case "browse":
      return (
        <BrowseView
          balance={balance}
          lifetimeEarned={lifetimeEarned}
          rewards={rewards}
          onRedeem={onRedeem}
        />
      );
    case "confirm":
      return reward ? (
        <ConfirmStep
          reward={reward}
          balance={balance}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      ) : (
        <BrowseView
          balance={balance}
          lifetimeEarned={lifetimeEarned}
          rewards={rewards}
          onRedeem={onRedeem}
        />
      );
    case "pending":
      return <PendingStep />;
    case "success":
      return reward ? (
        <SuccessStep reward={reward} onDismiss={onDismiss} />
      ) : (
        <BrowseView
          balance={balance}
          lifetimeEarned={lifetimeEarned}
          rewards={rewards}
          onRedeem={onRedeem}
        />
      );
    case "error":
      return (
        <ErrorStep
          message={error ?? "An unexpected error occurred. Please try again."}
          onDismiss={onDismiss}
        />
      );
  }
}

// ── Main trigger + drawer ─────────────────────────────────────────

export default function LoyaltyDrawer() {
  const {
    balance,
    lifetimeEarned,
    rewards,
    redemption,
    startRedemption,
    confirmRedemption,
    dismissRedemption,
    cancelRedemption,
  } = useLoyalty();

  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click (matches NotificationCenter pattern)
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isInFlow = redemption.step !== "browse";
  const title = isInFlow ? "Redeem Reward" : "Loyalty Rewards";

  return (
    <div ref={drawerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open loyalty rewards"
        aria-expanded={open}
        className="relative rounded-full p-2 text-muted transition-colors hover:bg-line/60"
      >
        <HiGift aria-hidden className="text-xl" />
        {balance > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gold px-1 text-[9px] font-bold leading-none text-navy-ink">
            {balance > 999 ? "999+" : balance}
          </span>
        )}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-sm transition-opacity"
          aria-hidden
        />
      )}

      {/* Drawer panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-surface shadow-float transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <div className="flex items-center gap-2">
            {isInFlow && (
              <button
                type="button"
                onClick={cancelRedemption}
                aria-label="Go back"
                className="rounded-full p-1 text-muted transition-colors hover:bg-line/60"
              >
                <HiArrowLeft aria-hidden className="text-lg" />
              </button>
            )}
            <span className="text-sm font-semibold text-ink">{title}</span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close drawer"
            className="rounded-full p-1 text-muted transition-colors hover:bg-line/60"
          >
            <HiX aria-hidden className="text-lg" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <DrawerContent
            step={redemption.step}
            reward={redemption.reward}
            balance={balance}
            lifetimeEarned={lifetimeEarned}
            rewards={rewards}
            error={redemption.error}
            onRedeem={startRedemption}
            onConfirm={confirmRedemption}
            onCancel={cancelRedemption}
            onDismiss={dismissRedemption}
          />
        </div>
      </div>
    </div>
  );
}