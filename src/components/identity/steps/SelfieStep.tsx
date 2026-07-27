import DocumentDropzone from "@/components/identity/DocumentDropzone";

interface SelfieStepProps {
  selfieFile: File | null;
  onSelfieChange: (file: File) => void;
  error?: string;
}

export default function SelfieStep({ selfieFile, onSelfieChange, error }: SelfieStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted text-sm">
        Take a clear, well-lit photo of your face. Remove sunglasses or hats, and make sure
        there&apos;s no glare over your eyes.
      </p>
      <DocumentDropzone
        label="Selfie *"
        hint="Click to upload or drag and drop a selfie"
        file={selfieFile}
        onSelect={onSelfieChange}
        error={error}
      />
    </div>
  );
}
