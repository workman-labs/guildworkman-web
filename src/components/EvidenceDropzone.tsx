"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  HiCheckCircle,
  HiUpload,
  HiXCircle,
  HiDocument,
  HiExclamationCircle,
} from "react-icons/hi";

interface EvidenceFile {
  file: File;
  id: string;
  previewUrl?: string;
}

interface EvidenceDropzoneProps {
  files: EvidenceFile[];
  onAdd: (file: File) => void;
  onRemove: (id: string) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: Record<string, string[]>;
  error?: string;
}

const DEFAULT_ACCEPT = {
  "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
  "application/pdf": [".pdf"],
  "text/plain": [".txt"],
};

/** A multi-file evidence dropzone — users can upload images, PDFs and text
    files as supporting evidence for a dispute. Each file is shown as a card
    with a remove button and a size label. */
export default function EvidenceDropzone({
  files,
  onAdd,
  onRemove,
  maxFiles = 10,
  maxSizeMB = 10,
  accept = DEFAULT_ACCEPT,
  error,
}: EvidenceDropzoneProps) {
  const [fileError, setFileError] = useState<string | null>(null);

  const onDrop = useCallback(
    <T extends File>(accepted: T[], rejected: import("react-dropzone").FileRejection[]) => {
      setFileError(null);

      if (rejected.length > 0) {
        const msg = rejected[0].errors[0]?.message ?? "File rejected";
        setFileError(msg);
        return;
      }

      if (files.length + accepted.length > maxFiles) {
        setFileError(`You can upload at most ${maxFiles} files`);
        return;
      }

      for (const file of accepted) {
        if (file.size > maxSizeMB * 1024 * 1024) {
          setFileError(`"${file.name}" exceeds the ${maxSizeMB} MB limit`);
          return;
        }
        onAdd(file);
      }
    },
    [files.length, maxFiles, maxSizeMB, onAdd]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: maxFiles - files.length,
    maxSize: maxSizeMB * 1024 * 1024,
  });

  const isFull = files.length >= maxFiles;

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div>
      <span className="font-medium text-ink text-sm">
        Evidence files <span className="text-muted font-normal">(up to {maxFiles})</span>
      </span>

      {/* Upload zone */}
      <div
        {...getRootProps()}
        className={`mt-1.5 rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
          isFull
            ? "border-muted/40 bg-line/20 cursor-not-allowed"
            : error
              ? "border-err"
              : "border-line hover:border-navy-2"
        }`}
      >
        <input {...getInputProps()} disabled={isFull} />
        {isFull ? (
          <div className="flex flex-col items-center gap-2 text-muted">
            <HiCheckCircle className="text-3xl text-ok" />
            <p className="text-sm">Maximum {maxFiles} files reached</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted">
            <HiUpload className="text-2xl text-terra" />
            <p className="text-sm">
              {isDragActive
                ? "Drop files here..."
                : "Click to upload or drag & drop (images, PDF, TXT)"}
            </p>
            <p className="text-xs text-muted/70">
              Max {maxSizeMB} MB per file
            </p>
          </div>
        )}
      </div>

      {/* Per-file error */}
      {fileError && (
        <p className="flex items-center gap-1 text-err text-xs mt-1">
          <HiExclamationCircle className="shrink-0" />
          {fileError}
        </p>
      )}

      {/* Global error */}
      {error && !fileError && (
        <p className="flex items-center gap-1 text-err text-xs mt-1">
          <HiExclamationCircle className="shrink-0" />
          {error}
        </p>
      )}

      {/* File list */}
      {files.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {files.map((ef) => (
            <li
              key={ef.id}
              className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm"
            >
              <HiDocument className="text-lg text-navy-2 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-ink truncate">{ef.file.name}</p>
                <p className="text-muted text-xs">{formatSize(ef.file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(ef.id)}
                className="text-muted hover:text-err transition-colors shrink-0"
                aria-label={`Remove ${ef.file.name}`}
              >
                <HiXCircle className="text-xl" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}