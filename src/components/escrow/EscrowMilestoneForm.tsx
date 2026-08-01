"use client";

import { useState } from "react";
import { Milestone } from "@/hooks/useEscrowWizard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface Props {
  milestones: Milestone[];
  onSetMilestones: (milestones: Milestone[]) => void;
  onBack: () => void;
  onNext: () => void;
}

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `milestone-${Date.now()}-${idCounter}`;
}

function emptyMilestone(): Milestone {
  return { id: nextId(), description: "", amount: 0, dueDate: "" };
}

export default function EscrowMilestoneForm({
  milestones,
  onSetMilestones,
  onBack,
  onNext,
}: Props) {
  // If no milestones, seed with one empty row
  const [items, setItems] = useState<Milestone[]>(
    milestones.length > 0 ? milestones : [emptyMilestone()]
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateItem = (id: string, field: keyof Milestone, value: string | number) => {
    setItems((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const addItem = () => {
    setItems((prev) => [...prev, emptyMilestone()]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return; // keep at least one
    setItems((prev) => prev.filter((m) => m.id !== id));
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    let totalPercent = 0;

    items.forEach((m, i) => {
      if (!m.description.trim()) {
        next[`desc-${m.id}`] = `Milestone ${i + 1} needs a description`;
      }
      if (m.amount <= 0) {
        next[`amt-${m.id}`] = "Amount must be > 0%";
      }
      if (m.amount > 100) {
        next[`amt-${m.id}`] = "Amount must be ≤ 100%";
      }
      if (!m.dueDate) {
        next[`date-${m.id}`] = "Please pick a due date";
      }
      totalPercent += m.amount;
    });

    if (totalPercent !== 100) {
      next["total"] = `Milestone percentages must add up to 100% (currently ${totalPercent}%)`;
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSetMilestones(items);
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-muted">
        Define milestone-based payouts. Each milestone represents a portion of
        the total escrow amount that will be released upon completion.
      </p>

      {errors.total && (
        <div
          className="rounded-xl bg-err/10 border border-err/30 px-4 py-3 text-sm text-err"
          role="alert"
        >
          {errors.total}
        </div>
      )}

      <div className="space-y-4">
        {items.map((milestone, index) => (
          <div
            key={milestone.id}
            className="rounded-2xl border border-line bg-surface p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-navy">
                Milestone {index + 1}
              </span>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(milestone.id)}
                  className="text-xs text-err hover:text-err/80 transition-colors"
                  aria-label={`Remove milestone ${index + 1}`}
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Description */}
              <div className="sm:col-span-1">
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium text-ink">Description</span>
                  <input
                    className="rounded-xl border px-4 py-3 text-sm text-ink placeholder:text-muted bg-surface outline-none transition-colors focus:border-navy-2 focus:ring-2 focus:ring-navy/15 border-line"
                    placeholder="e.g. Initial design mockups"
                    value={milestone.description}
                    onChange={(e) =>
                      updateItem(milestone.id, "description", e.target.value)
                    }
                  />
                  {errors[`desc-${milestone.id}`] && (
                    <span className="text-err text-xs">
                      {errors[`desc-${milestone.id}`]}
                    </span>
                  )}
                </label>
              </div>

              {/* Percentage */}
              <div>
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium text-ink">Allocation (%)</span>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    className="rounded-xl border px-4 py-3 text-sm text-ink placeholder:text-muted bg-surface outline-none transition-colors focus:border-navy-2 focus:ring-2 focus:ring-navy/15 border-line"
                    placeholder="e.g. 50"
                    value={milestone.amount || ""}
                    onChange={(e) =>
                      updateItem(milestone.id, "amount", Number(e.target.value))
                    }
                  />
                  {errors[`amt-${milestone.id}`] && (
                    <span className="text-err text-xs">
                      {errors[`amt-${milestone.id}`]}
                    </span>
                  )}
                </label>
              </div>

              {/* Due Date */}
              <div>
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium text-ink">Due Date</span>
                  <input
                    type="date"
                    className="rounded-xl border px-4 py-3 text-sm text-ink bg-surface outline-none transition-colors focus:border-navy-2 focus:ring-2 focus:ring-navy/15 border-line"
                    value={milestone.dueDate}
                    onChange={(e) =>
                      updateItem(milestone.id, "dueDate", e.target.value)
                    }
                  />
                  {errors[`date-${milestone.id}`] && (
                    <span className="text-err text-xs">
                      {errors[`date-${milestone.id}`]}
                    </span>
                  )}
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="text-sm font-medium text-navy-2 hover:text-navy transition-colors"
      >
        + Add another milestone
      </button>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" variant="primary" size="lg">
          Review & Confirm
        </Button>
      </div>
    </form>
  );
}