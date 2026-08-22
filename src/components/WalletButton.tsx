"use client";

import { useEffect, useRef, useState } from "react";
import { HiLink, HiChevronDown, HiLogout } from "react-icons/hi";
import { NETWORK_LABELS, truncateAddress } from "@/lib/wallet";
import { useWallet } from "@/components/wallet";

interface WalletButtonProps {
  variant?: "navbar" | "mobile";
}

export default function WalletButton({ variant = "navbar" }: WalletButtonProps) {
  const {
    address,
    network,
    connecting,
    error,
    freighterMissing,
    isWrongNetwork,
    expectedNetwork,
    connect,
    disconnect,
  } = useWallet();
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
    "inline-flex items-center gap-2 rounded-full border border-line px-4 py-1.5 text-sm text-ink hover:border-navy-2 transition-colors";

  if (address) {
    return (
      <div ref={rootRef} className={`relative ${variant === "mobile" ? "w-full" : ""}`}>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={`Wallet connected: ${truncateAddress(address)}${
            isWrongNetwork ? " — wrong network, action needed" : ""
          }`}
          className={`${baseButton} ${variant === "mobile" ? "w-full justify-between" : ""}`}
        >
          <span
            aria-hidden
            className={`h-2 w-2 rounded-full shrink-0 ${isWrongNetwork ? "bg-gold-deep" : "bg-ok"}`}
          />
          {truncateAddress(address)}
          <HiChevronDown aria-hidden className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-56 rounded-xl bg-surface text-ink shadow-lg border border-line overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-line">
              <p className="text-xs text-muted">Connected to</p>
              <p className="text-sm font-medium">{network ? NETWORK_LABELS[network] ?? network : "Stellar"}</p>
              {isWrongNetwork && (
                <p className="text-xs font-semibold text-gold-deep mt-1">
                  Switch to {NETWORK_LABELS[expectedNetwork] ?? expectedNetwork} in Freighter
                </p>
              )}
              <p className="text-xs text-muted mt-1 break-all">{address}</p>
            </div>
            <button
              onClick={() => {
                disconnect();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-err hover:bg-err/5"
            >
              <HiLogout aria-hidden /> Disconnect
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
        <HiLink aria-hidden />
        {connecting ? "Connecting..." : "Connect Wallet"}
      </button>
      {freighterMissing && (
        <p className={`text-xs text-gold-deep mt-2 ${variant === "navbar" ? "absolute right-0 w-48 text-right" : ""}`}>
          Freighter wallet not found.{" "}
          <a href="https://www.freighter.app/" target="_blank" rel="noreferrer" className="underline">
            Install it
          </a>{" "}
          to connect.
        </p>
      )}
      {error && !freighterMissing && (
        <p className={`text-xs text-err mt-2 ${variant === "navbar" ? "absolute right-0 w-48 text-right" : ""}`}>
          {error}
        </p>
      )}
    </div>
  );
}
