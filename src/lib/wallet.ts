/**
 * Wallet connection layer — session restore, and a live network-switch
 * guard, on top of `@stellar/freighter-api`.
 *
 * WHY isAllowed() INSTEAD OF TRUSTING THE SESSION FLAG ALONE
 * The original implementation restored a session purely from a localStorage
 * flag: if it was set, it assumed Freighter would hand back an address. That
 * breaks the moment access is revoked from inside the extension (or the flag
 * survives a browser profile that never granted it) — the UI would sit
 * "connecting" against a wallet that will never answer. `isAllowed()` asks
 * Freighter directly whether this origin currently holds a grant, so a
 * revoked/missing grant is detected up front and the stale flag is cleared
 * instead of leaving the app in limbo.
 *
 * WHY A LIVE WATCHER INSTEAD OF ONE-SHOT RESTORE
 * Freighter has no API to switch the network on a dApp's behalf (that's a
 * deliberate security boundary — only the user, inside the extension, can do
 * it), so "guided switching" here means detecting the change the user makes
 * themselves and reacting to it, not driving it. `WatchWalletChanges` polls
 * Freighter for the active address/network and reports a callback whenever
 * either changes. Running it for the lifetime of a connected session is what
 * lets `NetworkGuard` (see `src/components/wallet/NetworkGuard.tsx`) clear
 * itself the moment the user switches networks inside the extension, and
 * what catches an account switch or an access revocation without requiring a
 * reload.
 *
 * WHY THIS HOOK IS WRAPPED IN A CONTEXT PROVIDER
 * `useWalletState` below owns real side effects — a session restore on
 * mount and, once connected, a live polling watcher. It's exported for
 * direct unit testing, but app code should never call it more than once:
 * every call is a fully independent instance with its own poller, so two
 * components each calling it (e.g. the navbar's desktop and mobile
 * `WalletButton`, which are both mounted at once — only one is hidden via
 * CSS) would double the background polling and could see each other's
 * connect/disconnect drift out of sync. `WalletProvider` (in
 * `src/components/wallet/WalletProvider.tsx`) runs the one instance the app
 * uses; components consume it via `useWallet()` from `@/components/wallet`.
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  isConnected as freighterIsConnected,
  isAllowed as freighterIsAllowed,
  getAddress as freighterGetAddress,
  requestAccess as freighterRequestAccess,
  getNetwork as freighterGetNetwork,
  WatchWalletChanges,
} from "@stellar/freighter-api";
import { EXPECTED_STELLAR_NETWORK, type StellarNetwork } from "@/lib/config";

const SESSION_KEY = "gw_wallet_connected";
/** How often the live watcher polls Freighter for address/network changes. */
const WATCH_INTERVAL_MS = 3000;

export const NETWORK_LABELS: Record<string, string> = {
  PUBLIC: "Mainnet",
  TESTNET: "Testnet",
  FUTURENET: "Futurenet",
};

export function truncateAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

interface WalletState {
  address: string | null;
  network: string | null;
  connecting: boolean;
  /** True only while a previously-authorized session is being re-verified
      on mount — distinct from `connecting`, which is a user-initiated
      request-access flow that can prompt the extension's UI. */
  restoring: boolean;
  error: string | null;
  freighterMissing: boolean;
}

const initialState: WalletState = {
  address: null,
  network: null,
  connecting: false,
  restoring: false,
  error: null,
  freighterMissing: false,
};

/** The stateful engine behind wallet connection — see `WalletProvider` doc
    comment above for why app code should go through that provider's
    `useWallet()` instead of calling this directly (tests are the
    exception: they exercise this hook in isolation). */
export function useWalletState() {
  const [state, setState] = useState<WalletState>(initialState);
  const watcherRef = useRef<WatchWalletChanges | null>(null);

  const stopWatching = useCallback(() => {
    watcherRef.current?.stop();
    watcherRef.current = null;
  }, []);

  const startWatching = useCallback(() => {
    stopWatching();
    const watcher = new WatchWalletChanges(WATCH_INTERVAL_MS);
    watcherRef.current = watcher;
    watcher.watch(({ address, network, error }) => {
      if (error || !address) {
        // Access was revoked (or the extension locked) since we last
        // checked — fall back to disconnected rather than show a session
        // that no longer exists on Freighter's side.
        localStorage.removeItem(SESSION_KEY);
        stopWatching();
        setState(initialState);
        return;
      }
      setState((s) => ({ ...s, address, network: network || s.network }));
    });
  }, [stopWatching]);

  useEffect(() => stopWatching, [stopWatching]);

  // Restore a previously-authorized session on mount (page load / reload).
  useEffect(() => {
    if (localStorage.getItem(SESSION_KEY) !== "true") return;

    let cancelled = false;
    setState((s) => ({ ...s, restoring: true }));

    (async () => {
      const { isConnected } = await freighterIsConnected();
      if (!isConnected) {
        if (!cancelled) {
          localStorage.removeItem(SESSION_KEY);
          setState((s) => ({ ...s, restoring: false }));
        }
        return;
      }

      const { isAllowed } = await freighterIsAllowed();
      if (!isAllowed) {
        if (!cancelled) {
          localStorage.removeItem(SESSION_KEY);
          setState((s) => ({ ...s, restoring: false }));
        }
        return;
      }

      const [{ address, error: addrError }, { network }] = await Promise.all([
        freighterGetAddress(),
        freighterGetNetwork(),
      ]);
      if (cancelled) return;

      if (addrError || !address) {
        localStorage.removeItem(SESSION_KEY);
        setState((s) => ({ ...s, restoring: false }));
        return;
      }

      setState((s) => ({ ...s, address, network: network || null, restoring: false }));
      startWatching();
    })();

    return () => {
      cancelled = true;
    };
    // Restore runs once on mount; startWatching/stopWatching are stable refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connect = useCallback(async () => {
    setState((s) => ({ ...s, connecting: true, error: null, freighterMissing: false }));

    const { isConnected } = await freighterIsConnected();
    if (!isConnected) {
      setState((s) => ({ ...s, connecting: false, freighterMissing: true }));
      return;
    }

    const { address, error } = await freighterRequestAccess();
    if (error || !address) {
      setState((s) => ({
        ...s,
        connecting: false,
        error: error ? String(error) : "Connection was declined.",
      }));
      return;
    }

    const { network } = await freighterGetNetwork();
    localStorage.setItem(SESSION_KEY, "true");
    setState({
      address,
      network: network ?? null,
      connecting: false,
      restoring: false,
      error: null,
      freighterMissing: false,
    });
    startWatching();
  }, [startWatching]);

  const disconnect = useCallback(() => {
    stopWatching();
    localStorage.removeItem(SESSION_KEY);
    setState(initialState);
  }, [stopWatching]);

  /** Re-checks the active network immediately, rather than waiting for the
      watcher's next poll — used by NetworkGuard's "check again" action so
      switching inside Freighter feels instant. */
  const recheckNetwork = useCallback(async () => {
    const { network } = await freighterGetNetwork();
    if (network) setState((s) => ({ ...s, network }));
  }, []);

  const isWrongNetwork =
    state.address !== null && state.network !== null && state.network !== EXPECTED_STELLAR_NETWORK;

  return {
    ...state,
    isWrongNetwork,
    expectedNetwork: EXPECTED_STELLAR_NETWORK,
    connect,
    disconnect,
    recheckNetwork,
  };
}

export type WalletContextValue = ReturnType<typeof useWalletState>;

/** Re-exported so consumers can type `expectedNetwork` precisely without
    reaching into `@/lib/config` themselves. */
export type { StellarNetwork };
