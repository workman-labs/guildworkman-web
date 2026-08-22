"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useWalletState, type WalletContextValue } from "@/lib/wallet";

const WalletContext = createContext<WalletContextValue | null>(null);

/**
 * Owns the single `useWalletState()` instance for the whole app — session
 * restore and the live network-switch watcher both run real side effects
 * (Freighter calls, a polling interval), so every consumer sharing one
 * instance through context is what keeps that to one poller and one source
 * of truth, rather than each `WalletButton`/`NetworkGuard` mount running
 * its own independent copy. See the WHY comment above `useWalletState` in
 * `src/lib/wallet.ts` for the failure mode this avoids.
 */
export function WalletProvider({ children }: { children: ReactNode }) {
  const wallet = useWalletState();
  return <WalletContext.Provider value={wallet}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used within a <WalletProvider>");
  }
  return ctx;
}
