"use client";

import { EscrowFormData } from "@/hooks/useEscrowWizard";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

interface Props {
  data: EscrowFormData;
  onBack: () => void;
  onSubmit: () => void;
}

export default function EscrowReviewConfirm({ data, onBack, onSubmit }: Props) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        Please review the escrow details before submitting. Once confirmed, you
        will be asked to connect your wallet and sign the transaction.
      </p>

      {/* Funding Summary */}
      <Card className="p-5 space-y-3">
        <h3 className="text-sm font-semibold text-navy uppercase tracking-wide">
          Funding Details
        </h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Amount</dt>
            <dd className="font-semibold text-ink">
              {data.amount || "—"} XLM
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Recipient</dt>
            <dd className="font-mono text-xs text-ink break-all max-w-[260px] text-right">
              {data.recipient || "—"}
            </dd>
          </div>
          {data.memo && (
            <div className="flex justify-between">
              <dt className="text-muted">Memo</dt>
              <dd className="text-ink text-right max-w-[200px]">{data.memo}</dd>
            </div>
          )}
        </dl>
      </Card>

      {/* Milestones Summary */}
      <Card className="p-5 space-y-3">
        <h3 className="text-sm font-semibold text-navy uppercase tracking-wide">
          Milestone Schedule
        </h3>
        {data.milestones.length === 0 ? (
          <p className="text-sm text-muted">No milestones defined</p>
        ) : (
          <ul className="space-y-2">
            {data.milestones.map((m, i) => (
              <li key={m.id} className="flex items-start gap-3 text-sm">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-navy-tint text-navy text-xs font-bold">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink truncate">
                    {m.description}
                  </p>
                  <p className="text-muted text-xs">
                    {m.amount}% · Due{" "}
                    {m.dueDate
                      ? new Date(m.dueDate).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
                <span className="shrink-0 font-semibold text-navy text-xs">
                  {m.amount}%
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          variant="gold"
          size="lg"
          onClick={onSubmit}
        >
          Confirm & Submit
        </Button>
      </div>
    </div>
  );
}