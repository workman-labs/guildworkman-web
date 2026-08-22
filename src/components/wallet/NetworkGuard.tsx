"use client";

import { useState } from "react";
import { HiExclamationCircle } from "react-icons/hi";
import Button from "@/components/ui/Button";
import { NETWORK_LABELS, useWallet } from "@/lib/wallet";

/**
 * App-wide banner that appears whenever a connected wallet is on the wrong
 * Stellar network. Freighter has no API to switch its own network on a
 * dApp's behalf, so this guides the user through doing it themselves rather
 * than pretending to do it for them — the underlying `useWallet` watcher
 * clears the banner automatically once it detects the switch (usually
 * within a few seconds); "Check again" just short-circuits that wait.
 */
export default function NetworkGuard() {
  const { address, network, isWrongNetwork, expectedNetwork, recheckNetwork } = useWallet();
  const [checking, setChecking] = useState(false);

  if (!address || !isWrongNetwork) return null;

  const currentLabel = network ? NETWORK_LABELS[network] ?? network : "an unrecognized network";
  const expectedLabel = NETWORK_LABELS[expectedNetwork] ?? expectedNetwork;

  async function handleRecheck() {
    setChecking(true);
    await recheckNetwork();
    setChecking(false);
  }

  return (
    <div role="alert" className="sticky top-16 z-40 border-b border-gold-deep/30 bg-gold/15">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-3 text-sm text-ink sm:flex-row sm:items-center sm:justify-between md:px-10">
        <div className="flex items-start gap-2">
          <HiExclamationCircle className="mt-0.5 shrink-0 text-lg text-gold-deep" aria-hidden />
          <p>
            <span className="font-semibold">Wrong network —</span> your wallet is connected to{" "}
            <span className="font-semibold">{currentLabel}</span>, but GuildWorkman runs on{" "}
            <span className="font-semibold">{expectedLabel}</span>. Open the Freighter extension and switch its
            network to {expectedLabel}; this banner clears itself once it detects the change.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handleRecheck} disabled={checking} className="shrink-0">
          {checking ? "Checking…" : "I've switched — check again"}
        </Button>
      </div>
    </div>
  );
}
