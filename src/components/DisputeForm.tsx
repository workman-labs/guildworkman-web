"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { HiExclamationCircle, HiCheckCircle } from "react-icons/hi";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import EvidenceDropzone from "@/components/EvidenceDropzone";

/* ─── Schema ─────────────────────────────────────── */

const DISPUTE_REASONS = [
  { value: "service_not_completed", label: "Service not completed" },
  { value: "poor_quality", label: "Poor quality of work" },
  { value: "no_show", label: "Worker did not show up" },
  { value: "incorrect_charges", label: "Incorrect charges / overpayment" },
  { value: "damage_to_property", label: "Damage to property" },
  { value: "misrepresentation", label: "Misrepresentation of service" },
  { value: "other", label: "Other" },
] as const;

const schema = yup.object({
  disputeReason: yup.string().required("Please select a reason for the dispute"),
  description: yup
    .string()
    .min(20, "Please provide at least 20 characters of detail")
    .max(5000, "Description may not exceed 5,000 characters")
    .required("Please describe the issue in detail"),
  desiredResolution: yup
    .string()
    .min(10, "Please describe your desired resolution")
    .max(2000, "Resolution may not exceed 2,000 characters")
    .required("Please state your desired resolution"),
  appointmentId: yup.string().optional(),
  contactEmail: yup
    .string()
    .email("Please enter a valid email address")
    .required("A contact email is required so we can reach you"),
});

type DisputeFormValues = yup.InferType<typeof schema>;

/* ─── Evidence file type ──────────────────────────── */

interface EvidenceFile {
  file: File;
  id: string;
}

let nextId = 1;
function newEvidenceId(): string {
  return `ev-${nextId++}-${Date.now()}`;
}

/* ─── Submission helper ───────────────────────────── */

interface SubmitResult {
  status: "idle" | "submitting" | "success" | "error";
  message?: string;
  referenceId?: string;
}

async function submitDispute(
  _values: DisputeFormValues,
  _evidence: EvidenceFile[],
): Promise<{ referenceId: string }> {
  // Simulate API call with a realistic delay.
  // In production this would POST to /api/disputes with FormData.
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return { referenceId: `DSP-${Date.now().toString(36).toUpperCase()}` };
}

/* ─── Component ───────────────────────────────────── */

export default function DisputeForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<DisputeFormValues>({
    mode: "onChange",
    resolver: yupResolver(schema),
    defaultValues: {
      disputeReason: "",
      description: "",
      desiredResolution: "",
      appointmentId: "",
      contactEmail: "",
    },
  });

  const [evidence, setEvidence] = useState<EvidenceFile[]>([]);
  const [submitResult, setSubmitResult] = useState<SubmitResult>({ status: "idle" });

  const descriptionLength = watch("description")?.length ?? 0;

  function handleAddEvidence(file: File) {
    setEvidence((prev) => [...prev, { file, id: newEvidenceId() }]);
  }

  function handleRemoveEvidence(id: string) {
    setEvidence((prev) => prev.filter((ef) => ef.id !== id));
  }

  async function onSubmit(values: DisputeFormValues) {
    setSubmitResult({ status: "submitting" });
    try {
      const result = await submitDispute(values, evidence);
      setSubmitResult({
        status: "success",
        referenceId: result.referenceId,
      });
    } catch (error) {
      setSubmitResult({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    }
  }

  /* ─── Success state ──────────────────────────────── */
  if (submitResult.status === "success") {
    return (
      <Card className="p-8 max-w-2xl mx-auto text-center">
        <Badge tone="gold" className="mb-4">
          Dispute filed
        </Badge>
        <HiCheckCircle className="text-4xl text-ok mx-auto mb-4" />
        <h2 className="font-heading text-2xl font-semibold">Dispute submitted</h2>
        <p className="text-muted mt-2 max-w-md mx-auto">
          Your dispute has been received. Reference{" "}
          <span className="font-mono text-ink">{submitResult.referenceId}</span>.
          We&apos;ll review it and reach out to both parties within 1–2 business
          days.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => {
            setSubmitResult({ status: "idle" });
            setEvidence([]);
          }}
        >
          Submit another dispute
        </Button>
      </Card>
    );
  }

  /* ─── Form ───────────────────────────────────────── */
  return (
    <Card className="p-6 md:p-8 max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {/* Appointment ID (optional) */}
        <Input
          label="Appointment ID (optional)"
          placeholder="e.g. GW-12345"
          error={errors.appointmentId?.message}
          {...register("appointmentId")}
        />

        {/* Dispute reason */}
        <Select
          label="Reason for dispute *"
          error={errors.disputeReason?.message}
          {...register("disputeReason")}
        >
          <option value="">Select a reason…</option>
          {DISPUTE_REASONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </Select>

        {/* Description */}
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink">
            Description of the issue *
          </span>
          <textarea
            {...register("description")}
            rows={5}
            placeholder="Describe what happened in detail…"
            className={`rounded-xl border px-4 py-3 text-ink placeholder:text-muted bg-surface outline-none transition-colors focus:border-navy-2 focus:ring-2 focus:ring-navy/15 resize-y min-h-[120px] ${
              errors.description ? "border-err" : "border-line"
            }`}
          />
          <div className="flex justify-between text-xs">
            {errors.description ? (
              <span className="text-err">{errors.description.message}</span>
            ) : (
              <span />
            )}
            <span
              className={
                descriptionLength > 4500 ? "text-err" : "text-muted"
              }
            >
              {descriptionLength}/5000
            </span>
          </div>
        </label>

        {/* Desired resolution */}
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink">
            Desired resolution *
          </span>
          <textarea
            {...register("desiredResolution")}
            rows={3}
            placeholder="How would you like this resolved? (e.g. refund, redo, partial credit…)"
            className={`rounded-xl border px-4 py-3 text-ink placeholder:text-muted bg-surface outline-none transition-colors focus:border-navy-2 focus:ring-2 focus:ring-navy/15 resize-y min-h-[80px] ${
              errors.desiredResolution ? "border-err" : "border-line"
            }`}
          />
          {errors.desiredResolution && (
            <span className="text-err text-xs">
              {errors.desiredResolution.message}
            </span>
          )}
        </label>

        {/* Evidence upload */}
        <EvidenceDropzone
          files={evidence}
          onAdd={handleAddEvidence}
          onRemove={handleRemoveEvidence}
          maxFiles={10}
          maxSizeMB={10}
        />

        {/* Contact email */}
        <Input
          label="Contact email *"
          type="email"
          placeholder="you@example.com"
          error={errors.contactEmail?.message}
          {...register("contactEmail")}
        />

        {/* Error banner */}
        {submitResult.status === "error" && (
          <div className="flex items-start gap-2 rounded-xl bg-err/10 text-err text-sm p-3">
            <HiExclamationCircle className="text-lg shrink-0 mt-0.5" />
            <span>{submitResult.message}</span>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end pt-2 border-t border-line">
          <Button
            type="submit"
            disabled={
              !isValid || submitResult.status === "submitting"
            }
          >
            {submitResult.status === "submitting"
              ? "Submitting…"
              : submitResult.status === "error"
                ? "Retry submission"
                : "Submit dispute"}
          </Button>
        </div>
      </form>
    </Card>
  );
}