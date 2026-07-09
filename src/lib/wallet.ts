"use client";

import { useCallback, useEffect, useState } from "react";
import {
  isConnected as freighterIsConnected,
  getAddress as freighterGetAddress,
  requestAccess as freighterRequestAccess,
  getNetwork as freighterGetNetwork,
} from "@stellar/freighter-api";

const SESSION_KEY = "gw_wallet_connected";

export function truncateAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

interface WalletState {
  address: string | null;
  network: string | null;
  connecting: boolean;
  error: string | null;
  freighterMissing: boolean;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    network: null,
    connecting: false,
    error: null,
    freighterMissing: false,
  });

  useEffect(() => {
    if (localStorage.getItem(SESSION_KEY) !== "true") return;

    freighterIsConnected().then(({ isConnected, error }) => {
      if (error || !isConnected) return;
      freighterGetAddress().then(({ address, error: addrError }) => {
        if (addrError || !address) return;
        setState((s) => ({ ...s, address }));
        freighterGetNetwork().then(({ network }) => {
          setState((s) => ({ ...s, network: network ?? null }));
        });
      });
    });
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
      error: null,
      freighterMissing: false,
    });
  }, []);

  const disconnect = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setState({ address: null, network: null, connecting: false, error: null, freighterMissing: false });
  }, []);

  return { ...state, connect, disconnect };
}
