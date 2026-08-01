"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

interface Props {
  escrowData: {
    amount: string;
    recipient: string;
    memo: string;
  };
  onReset: () => void;
}

export default function EscrowSuccess({ escrowData, onReset }: Props) {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto size-20 rounded-full bg-ok/10 flex items-center justify-center">
        <svg
          className="size-10 text-ok"
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

      <div>
        <h2 className="text-2xl font-bold text-ink">
          Escrow Funded Successfully
        </h2>
        <p className="text-muted mt-2">
          Your escrow has been created and funds are secured on-chain.
        </p>
      </div>

      <Card className="p-5 text-left space-y-3 max-w-md mx-auto">
        <h3 className="text-sm font-semibold text-navy uppercase tracking-wide">
          Transaction Summary
        </h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Amount</dt>
            <dd className="font-semibold text-ink">
              {escrowData.amount || "—"} XLM
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Recipient</dt>
            <dd className="font-mono text-xs text-ink break-all max-w-[200px] text-right">
              {escrowData.recipient || "—"}
            </dd>
          </div>
          {escrowData.memo && (
            <div className="flex justify-between">
              <dt className="text-muted">Memo</dt>
              <dd className="text-ink text-right max-w-[200px]">
                {escrowData.memo}
              </dd>
            </div>
          )}
          <div className="border-t border-line pt-2 flex justify-between">
            <dt className="text-muted">Status</dt>
            <dd className="font-semibold text-ok">Active</dd>
          </div>
        </dl>
      </Card>

      <div className="pt-2">
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={onReset}
        >
          Fund Another Escrow
        </Button>
      </div>
    </div>
  );
}