import { useDropzone } from "react-dropzone";
import { HiCheckCircle, HiUpload } from "react-icons/hi";

interface DocumentDropzoneProps {
  label: string;
  hint: string;
  file: File | null;
  onSelect: (file: File) => void;
  error?: string;
}

/** A single labeled image dropzone — shared by the document-upload and
    selfie steps so both look and behave the same way. */
export default function DocumentDropzone({ label, hint, file, onSelect, error }: DocumentDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (accepted) => {
      if (accepted[0]) onSelect(accepted[0]);
    },
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  return (
    <div>
      <span className="font-medium text-ink text-sm">{label}</span>
      <div
        {...getRootProps()}
        className={`mt-1.5 rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
          error ? "border-err" : "border-line hover:border-navy-2"
        }`}
      >
        <input {...getInputProps()} />
        {file ? (
          <div className="flex flex-col items-center gap-2 text-ok">
            <HiCheckCircle className="text-3xl" />
            <p className="text-sm text-ink">{file.name}</p>
            <p className="text-xs text-muted">Click or drop to replace</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted">
            <HiUpload className="text-2xl text-terra" />
            <p className="text-sm">{isDragActive ? "Drop the image here..." : hint}</p>
          </div>
        )}
      </div>
      {error && <p className="text-err text-xs mt-1">{error}</p>}
    </div>
  );
}
