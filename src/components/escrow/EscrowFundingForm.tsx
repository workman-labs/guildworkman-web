"use client";

import { useState } from "react";
import { EscrowFormData } from "@/hooks/useEscrowWizard";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface Props {
  data: EscrowFormData;
  onUpdate: (payload: Partial<EscrowFormData>) => void;
  onNext: () => void;
}

export default function EscrowFundingForm({ data, onUpdate, onNext }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const next: Record<string, string> = {};

    if (!data.amount || Number(data.amount) <= 0) {
      next.amount = "Please enter a valid amount greater than 0";
    }

    if (!data.recipient || !data.recipient.startsWith("G") || data.recipient.length !== 56) {
      next.recipient = "Please enter a valid Stellar public key (starts with G, 56 chars)";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-muted">
        Enter the funding details for the escrow. Funds will be held securely
        until the milestone conditions are met.
      </p>

      <Input
        label="Escrow Amount (XLM)"
        type="number"
        step="0.0000001"
        min="0"
        placeholder="e.g. 100"
        value={data.amount}
        onChange={(e) => onUpdate({ amount: e.target.value })}
        error={errors.amount}
        autoFocus
      />

      <Input
        label="Recipient Stellar Public Key"
        placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
        value={data.recipient}
        onChange={(e) => onUpdate({ recipient: e.target.value })}
        error={errors.recipient}
        maxLength={56}
      />

      <Input
        label="Memo (optional)"
        placeholder="Payment for website redesign — milestone 1"
        value={data.memo}
        onChange={(e) => onUpdate({ memo: e.target.value })}
        maxLength={256}
      />

      <div className="flex justify-end pt-2">
        <Button type="submit" variant="primary" size="lg">
          Continue to Milestones
        </Button>
      </div>
    </form>
  );
}