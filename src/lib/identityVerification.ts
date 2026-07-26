/**
 * Onboarding identity verification wizard — state shape, save-and-resume
 * persistence, and the submission call.
 *
 * WHY THIS IS A FRONTEND-ONLY STUB (read before wiring a real endpoint)
 * `guildworkman-core` doesn't expose an identity-verification endpoint yet —
 * only `/api/v1/client/*`, `/api/v1/skilledWorker/*`, and `/api/v1/auth/*`
 * (see `src/lib/api.ts`). Rather than invent a REST shape the backend can't
 * answer, `submitIdentityVerification` below simulates the round trip
 * (latency + a success/failure outcome) so the wizard's step validation,
 * save-and-resume, and error-recovery UI are fully exercised today. Swap its
 * body for a real `postJson(...)` call in `lib/api.ts` once the backend adds
 * the route — the wizard component doesn't need to change, only this
 * function's implementation.
 *
 * WHY UPLOADED FILES ARE NOT PERSISTED
 * `localStorage` is the only realistic client-side store for save-and-resume
 * (it's what `slotLock.ts` already uses), but it's a poor — and, for a photo
 * ID or a selfie, actively unsafe — place to keep sensitive document images:
 * it's unencrypted, has no expiry of its own, and a multi-MB data URL risks
 * blowing the ~5MB quota outright. So only non-sensitive step data (names,
 * document numbers, which step you were on) is persisted; uploaded files
 * live in React state only. Resuming after a reload restores every answered
 * field but asks the user to re-attach documents/selfie — a deliberate
 * trade-off of a little resume friction for not writing ID photos to disk.
 */

export type DocumentType = "national-id" | "passport" | "drivers-license";

export interface PersonalDetails {
  fullName: string;
  dateOfBirth: string;
  nationality: string;
  phoneNumber: string;
}

export interface DocumentDetails {
  documentType: DocumentType | "";
  documentNumber: string;
}

/** Document types whose back side actually carries information; passports
    are a single data page, so we don't ask for a "back" scan of one. */
export const DOCUMENT_TYPES_REQUIRING_BACK: DocumentType[] = ["national-id", "drivers-license"];

export interface IdentityVerificationFormValues {
  personal: PersonalDetails;
  document: DocumentDetails;
}

export const EMPTY_FORM_VALUES: IdentityVerificationFormValues = {
  personal: { fullName: "", dateOfBirth: "", nationality: "", phoneNumber: "" },
  document: { documentType: "", documentNumber: "" },
};

export const STEP_IDS = ["personal", "document", "upload", "selfie", "review"] as const;
export type StepId = (typeof STEP_IDS)[number];

export const STEP_LABELS: Record<StepId, string> = {
  personal: "Personal details",
  document: "Document type",
  upload: "Upload document",
  selfie: "Selfie check",
  review: "Review & submit",
};

/** Field paths (dot-notation, matching react-hook-form's `trigger` API)
    validated before a step is allowed to advance. Upload/selfie/review are
    validated separately since they gate on files held in component state,
    not registered form fields. */
export const STEP_VALIDATION_FIELDS: Partial<Record<StepId, string[]>> = {
  personal: ["personal.fullName", "personal.dateOfBirth", "personal.nationality", "personal.phoneNumber"],
  document: ["document.documentType", "document.documentNumber"],
};

const STORAGE_KEY = "gw-identity-verification-v1";

export interface PersistedProgress {
  step: number;
  values: IdentityVerificationFormValues;
  /** Filenames only, so a resumed session can show "you'd attached X" —
      never the file contents themselves (see module doc comment). */
  attachedFileNames: Partial<Record<"front" | "back" | "selfie", string>>;
  savedAt: string;
}

export function loadProgress(): PersistedProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedProgress;
  } catch {
    return null;
  }
}

export function saveProgress(progress: Omit<PersistedProgress, "savedAt">): void {
  if (typeof window === "undefined") return;
  const record: PersistedProgress = { ...progress, savedAt: new Date().toISOString() };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Quota exceeded or storage disabled — resume just won't be available.
  }
}

export function clearProgress(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export interface IdentityVerificationPayload extends IdentityVerificationFormValues {
  hasFrontUpload: boolean;
  hasBackUpload: boolean;
  hasSelfie: boolean;
}

export interface IdentityVerificationResult {
  referenceId: string;
  status: "pending-review";
}

/** Simulated submission — see the module doc comment for why this doesn't
    call a real backend endpoint yet. Fails roughly 1 in 6 tries so the
    wizard's error-recovery path (inline error + retry, form left intact) is
    reachable without special test hooks. */
export function submitIdentityVerification(
  payload: IdentityVerificationPayload
): Promise<IdentityVerificationResult> {
  void payload; // not sent anywhere yet — see module doc comment
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 1 / 6) {
        reject(new Error("We couldn't reach the verification service. Please try again."));
        return;
      }
      resolve({
        referenceId: `IDV-${Date.now().toString(36).toUpperCase()}`,
        status: "pending-review",
      });
    }, 1200);
  });
}
