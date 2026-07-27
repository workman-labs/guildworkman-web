import { useFormContext } from "react-hook-form";
import DocumentDropzone from "@/components/identity/DocumentDropzone";
import {
  DOCUMENT_TYPES_REQUIRING_BACK,
  type IdentityVerificationFormValues,
} from "@/lib/identityVerification";

interface DocumentUploadStepProps {
  frontFile: File | null;
  backFile: File | null;
  onFrontChange: (file: File) => void;
  onBackChange: (file: File) => void;
  errors: { front?: string; back?: string };
}

export default function DocumentUploadStep({
  frontFile,
  backFile,
  onFrontChange,
  onBackChange,
  errors,
}: DocumentUploadStepProps) {
  const { watch } = useFormContext<IdentityVerificationFormValues>();
  const documentType = watch("document.documentType");
  const needsBack = DOCUMENT_TYPES_REQUIRING_BACK.includes(
    documentType as (typeof DOCUMENT_TYPES_REQUIRING_BACK)[number]
  );

  return (
    <div className="flex flex-col gap-5">
      <DocumentDropzone
        label="Front of document *"
        hint="Click to upload or drag and drop (JPG, PNG)"
        file={frontFile}
        onSelect={onFrontChange}
        error={errors.front}
      />

      {/* Progressive disclosure: the back-of-document upload only appears
          once a document type that actually has a back (national ID,
          driver's license) has been chosen — a passport's single data page
          never needs it. */}
      {needsBack && (
        <DocumentDropzone
          label="Back of document *"
          hint="Click to upload or drag and drop (JPG, PNG)"
          file={backFile}
          onSelect={onBackChange}
          error={errors.back}
        />
      )}
    </div>
  );
}
