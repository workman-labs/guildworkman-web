"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

interface Props {
  onBack: () => void;
  onConfirm: () => void;
}

export default function EscrowWalletConnect({ onBack, onConfirm }: Props) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    // Simulate wallet connection (in production, use Freighter or Stellar wallet)
    await new Promise((r) => setTimeout(r, 1500));
    setConnected(true);
    setConnecting(false);
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        Connect your Stellar wallet to sign the escrow funding transaction. Your
        wallet must have sufficient XLM balance to cover the escrow amount plus
        the minimum reserve.
      </p>

      {!connected ? (
        <div className="rounded-2xl border border-line bg-surface p-8 text-center space-y-4">
          <div className="mx-auto size-16 rounded-full bg-navy-tint flex items-center justify-center">
            <svg
              className="size-8 text-navy"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-ink">
            Connect Your Wallet
          </h3>
          <p className="text-sm text-muted max-w-sm mx-auto">
            You will need a Stellar wallet such as Freighter or Lobstr to sign
            the escrow transaction.
          </p>
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={handleConnect}
            disabled={connecting}
          >
            {connecting ? "Connecting…" : "Connect Wallet"}
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl border border-ok/30 bg-ok/5 p-8 text-center space-y-4">
          <div className="mx-auto size-16 rounded-full bg-ok/10 flex items-center justify-center">
            <svg
              className="size-8 text-ok"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-ink">
            Wallet Connected
          </h3>
          <p className="text-sm text-muted max-w-sm mx-auto">
            Your wallet is ready. Click below to sign and submit the escrow
            funding transaction.
          </p>
          <div className="flex justify-center gap-3">
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={onConfirm}
            >
              Sign & Submit
            </Button>
          </div>
        </div>
      )}

      <div className="flex justify-start pt-2">
        <Button type="button" variant="outline" size="lg" onClick={onBack}>
          Back
        </Button>
      </div>
    </div>
  );
}