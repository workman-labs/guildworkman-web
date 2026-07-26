import { useFormContext } from "react-hook-form";
import type { IdentityVerificationFormValues } from "@/lib/identityVerification";

interface ReviewStepProps {
  frontFile: File | null;
  backFile: File | null;
  selfieFile: File | null;
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-line last:border-0">
      <span className="text-muted text-sm">{label}</span>
      <span className="text-ink text-sm font-medium text-right">{value || "—"}</span>
    </div>
  );
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  "national-id": "National ID",
  passport: "Passport",
  "drivers-license": "Driver's license",
};

export default function ReviewStep({ frontFile, backFile, selfieFile }: ReviewStepProps) {
  const { getValues } = useFormContext<IdentityVerificationFormValues>();
  const { personal, document } = getValues();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted mb-2">
          Personal details
        </h3>
        <ReviewRow label="Full name" value={personal.fullName} />
        <ReviewRow label="Date of birth" value={personal.dateOfBirth} />
        <ReviewRow label="Nationality" value={personal.nationality} />
        <ReviewRow label="Phone number" value={personal.phoneNumber} />
      </div>

      <div>
        <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted mb-2">
          Document
        </h3>
        <ReviewRow label="Type" value={DOCUMENT_TYPE_LABELS[document.documentType] ?? ""} />
        <ReviewRow label="Number" value={document.documentNumber} />
        <ReviewRow label="Front upload" value={frontFile?.name ?? ""} />
        {backFile && <ReviewRow label="Back upload" value={backFile.name} />}
        <ReviewRow label="Selfie" value={selfieFile?.name ?? ""} />
      </div>

      <p className="text-xs text-muted">
        By submitting, you confirm the information above is accurate and consent to it being used
        to verify your identity.
      </p>
    </div>
  );
}
