"use client";

import { useEffect, useRef, useState } from "react";
import { HiLink, HiChevronDown, HiLogout } from "react-icons/hi";
import { truncateAddress, useWallet } from "@/lib/wallet";

const NETWORK_LABELS: Record<string, string> = {
  PUBLIC: "Mainnet",
  TESTNET: "Testnet",
  FUTURENET: "Futurenet",
};

interface WalletButtonProps {
  variant?: "navbar" | "mobile";
}

export default function WalletButton({ variant = "navbar" }: WalletButtonProps) {
  const { address, network, connecting, error, freighterMissing, connect, disconnect } = useWallet();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const baseButton =
    "inline-flex items-center gap-2 rounded-full border border-cream/40 px-4 py-1.5 text-sm text-cream hover:bg-cream/10 transition-colors";

  if (address) {
    return (
      <div ref={rootRef} className={`relative ${variant === "mobile" ? "w-full" : ""}`}>
        <button
          onClick={() => setOpen((o) => !o)}
          className={`${baseButton} ${variant === "mobile" ? "w-full justify-between" : ""}`}
        >
          <span className="h-2 w-2 rounded-full bg-success shrink-0" />
          {truncateAddress(address)}
          <HiChevronDown className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white text-ink-900 shadow-lg border border-ink-100 overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-ink-100">
              <p className="text-xs text-ink-500">Connected to</p>
              <p className="text-sm font-medium">{network ? NETWORK_LABELS[network] ?? network : "Stellar"}</p>
              <p className="text-xs text-ink-500 mt-1 break-all">{address}</p>
            </div>
            <button
              onClick={() => {
                disconnect();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-error hover:bg-error/5"
            >
              <HiLogout /> Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={rootRef} className={`relative ${variant === "mobile" ? "w-full" : ""}`}>
      <button
        onClick={connect}
        disabled={connecting}
        className={`${baseButton} ${variant === "mobile" ? "w-full justify-center" : ""} disabled:opacity-60`}
      >
        <HiLink />
        {connecting ? "Connecting..." : "Connect Wallet"}
      </button>
      {freighterMissing && (
        <p className={`text-xs text-gold-500 mt-2 ${variant === "navbar" ? "absolute right-0 w-48 text-right" : ""}`}>
          Freighter wallet not found.{" "}
          <a href="https://www.freighter.app/" target="_blank" rel="noreferrer" className="underline">
            Install it
          </a>{" "}
          to connect.
        </p>
      )}
      {error && !freighterMissing && (
        <p className={`text-xs text-error mt-2 ${variant === "navbar" ? "absolute right-0 w-48 text-right" : ""}`}>
          {error}
        </p>
      )}
    </div>
  );
}
