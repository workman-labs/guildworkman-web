"use client";

import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm, type FieldPath } from "react-hook-form";
import { HiExclamationCircle } from "react-icons/hi";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import IdentityStepper from "./IdentityStepper";
import PersonalDetailsStep from "./steps/PersonalDetailsStep";
import DocumentSelectionStep from "./steps/DocumentSelectionStep";
import DocumentUploadStep from "./steps/DocumentUploadStep";
import SelfieStep from "./steps/SelfieStep";
import ReviewStep from "./steps/ReviewStep";
import {
  DOCUMENT_TYPES_REQUIRING_BACK,
  EMPTY_FORM_VALUES,
  STEP_IDS,
  STEP_VALIDATION_FIELDS,
  clearProgress,
  loadProgress,
  saveProgress,
  submitIdentityVerification,
  type IdentityVerificationFormValues,
  type StepId,
} from "@/lib/identityVerification";

type UploadKey = "front" | "back" | "selfie";

const UPLOAD_STEP_INDEX = STEP_IDS.indexOf("upload");
const REVIEW_STEP_INDEX = STEP_IDS.indexOf("review");

export default function IdentityVerificationWizard() {
  const form = useForm<IdentityVerificationFormValues>({
    mode: "onChange",
    defaultValues: EMPTY_FORM_VALUES,
  });
  const { trigger, watch, reset } = form;

  const [stepIndex, setStepIndex] = useState(0);
  const [furthestValidatedIndex, setFurthestValidatedIndex] = useState(0);
  const [files, setFiles] = useState<Record<UploadKey, File | null>>({
    front: null,
    back: null,
    selfie: null,
  });
  const [fileErrors, setFileErrors] = useState<Partial<Record<UploadKey, string>>>({});
  const [resumeState, setResumeState] = useState<"checking" | "offered" | "dismissed">("checking");
  const [resumeSummary, setResumeSummary] = useState<{ step: number; savedAt: string } | null>(null);
  const [submission, setSubmission] = useState<
    { status: "idle" | "submitting" } | { status: "error"; message: string } | { status: "success"; referenceId: string }
  >({ status: "idle" });
  const [needsReattachNotice, setNeedsReattachNotice] = useState(false);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Offer to resume a saved session once, on mount.
  useEffect(() => {
    const saved = loadProgress();
    if (saved) {
      setResumeSummary({ step: saved.step, savedAt: saved.savedAt });
      setResumeState("offered");
    } else {
      setResumeState("dismissed");
    }
  }, []);

  // Debounce-persist step data (never file contents) whenever it changes.
  useEffect(() => {
    if (resumeState === "checking") return;
    const subscription = watch((values) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        saveProgress({
          step: stepIndex,
          values: values as IdentityVerificationFormValues,
          attachedFileNames: {
            front: files.front?.name,
            back: files.back?.name,
            selfie: files.selfie?.name,
          },
        });
      }, 500);
    });
    return () => {
      subscription.unsubscribe();
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [watch, stepIndex, files, resumeState]);

  function handleResume() {
    const saved = loadProgress();
    if (!saved) return;
    reset(saved.values);
    // Files can't be restored (see lib doc comment) — if the saved session
    // had gotten past the upload/selfie steps, send the user back to
    // whichever of those comes first so they can re-attach before
    // continuing, rather than silently landing past a step with no file.
    const hadUploads = Object.keys(saved.attachedFileNames).length > 0;
    const targetStep =
      hadUploads && saved.step > UPLOAD_STEP_INDEX ? UPLOAD_STEP_INDEX : saved.step;
    setNeedsReattachNotice(hadUploads && saved.step > UPLOAD_STEP_INDEX);
    setStepIndex(targetStep);
    setFurthestValidatedIndex(Math.max(targetStep, saved.step > UPLOAD_STEP_INDEX ? UPLOAD_STEP_INDEX : saved.step));
    setResumeState("dismissed");
  }

  function handleStartOver() {
    clearProgress();
    reset(EMPTY_FORM_VALUES);
    setFiles({ front: null, back: null, selfie: null });
    setStepIndex(0);
    setFurthestValidatedIndex(0);
    setResumeState("dismissed");
  }

  function validateUploadStep(): boolean {
    const documentType = form.getValues("document.documentType");
    const needsBack = DOCUMENT_TYPES_REQUIRING_BACK.includes(
      documentType as (typeof DOCUMENT_TYPES_REQUIRING_BACK)[number]
    );
    const errors: Partial<Record<UploadKey, string>> = {};
    if (!files.front) errors.front = "Please upload the front of your document";
    if (needsBack && !files.back) errors.back = "Please upload the back of your document";
    setFileErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function validateSelfieStep(): boolean {
    if (!files.selfie) {
      setFileErrors({ selfie: "Please upload a selfie" });
      return false;
    }
    setFileErrors({});
    return true;
  }

  async function handleContinue() {
    const stepId: StepId = STEP_IDS[stepIndex];
    let valid = true;

    const fieldsToValidate = STEP_VALIDATION_FIELDS[stepId];
    if (fieldsToValidate) {
      valid = await trigger(fieldsToValidate as FieldPath<IdentityVerificationFormValues>[]);
    } else if (stepId === "upload") {
      valid = validateUploadStep();
    } else if (stepId === "selfie") {
      valid = validateSelfieStep();
    }

    if (!valid) return;

    setNeedsReattachNotice(false);
    const nextIndex = Math.min(stepIndex + 1, STEP_IDS.length - 1);
    setStepIndex(nextIndex);
    setFurthestValidatedIndex((prev) => Math.max(prev, nextIndex));
  }

  function handleBack() {
    setStepIndex((prev) => Math.max(prev - 1, 0));
  }

  function handleStepSelect(index: number) {
    if (index <= furthestValidatedIndex) setStepIndex(index);
  }

  async function handleSubmit() {
    setSubmission({ status: "submitting" });
    try {
      const values = form.getValues();
      const result = await submitIdentityVerification({
        ...values,
        hasFrontUpload: Boolean(files.front),
        hasBackUpload: Boolean(files.back),
        hasSelfie: Boolean(files.selfie),
      });
      clearProgress();
      setSubmission({ status: "success", referenceId: result.referenceId });
    } catch (error) {
      setSubmission({
        status: "error",
        message: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      });
    }
  }

  if (submission.status === "success") {
    return (
      <Card className="p-8 max-w-xl mx-auto text-center">
        <Badge tone="success" className="mb-4">
          Pending review
        </Badge>
        <h2 className="font-heading text-2xl font-semibold">Verification submitted</h2>
        <p className="text-muted mt-2">
          Reference <span className="font-mono text-ink">{submission.referenceId}</span>. We&apos;ll
          notify you once it&apos;s been reviewed — this usually takes 1–2 business days.
        </p>
      </Card>
    );
  }

  const stepId = STEP_IDS[stepIndex];
  const isLastStep = stepIndex === REVIEW_STEP_INDEX;

  return (
    <Card className="p-6 md:p-8 max-w-xl mx-auto">
      {resumeState === "offered" && resumeSummary && (
        <div className="mb-6 rounded-xl bg-navy-tint text-navy-2 text-sm p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <span>
            You have an unfinished verification from{" "}
            {new Date(resumeSummary.savedAt).toLocaleString()}.
          </span>
          <div className="flex gap-2 shrink-0">
            <Button size="sm" variant="secondary" onClick={handleResume}>
              Resume
            </Button>
            <Button size="sm" variant="outline" onClick={handleStartOver}>
              Start over
            </Button>
          </div>
        </div>
      )}

      {needsReattachNotice && (
        <div className="mb-6 rounded-xl bg-gold/15 text-gold-deep text-sm p-4">
          For your security, we don&apos;t save uploaded documents between sessions — please
          re-attach your document and selfie to continue.
        </div>
      )}

      <IdentityStepper
        currentIndex={stepIndex}
        furthestValidatedIndex={furthestValidatedIndex}
        onStepSelect={handleStepSelect}
      />

      <FormProvider {...form}>
        <div className="mb-6">
          {stepId === "personal" && <PersonalDetailsStep />}
          {stepId === "document" && <DocumentSelectionStep />}
          {stepId === "upload" && (
            <DocumentUploadStep
              frontFile={files.front}
              backFile={files.back}
              onFrontChange={(file) => setFiles((prev) => ({ ...prev, front: file }))}
              onBackChange={(file) => setFiles((prev) => ({ ...prev, back: file }))}
              errors={fileErrors}
            />
          )}
          {stepId === "selfie" && (
            <SelfieStep
              selfieFile={files.selfie}
              onSelfieChange={(file) => setFiles((prev) => ({ ...prev, selfie: file }))}
              error={fileErrors.selfie}
            />
          )}
          {stepId === "review" && (
            <ReviewStep frontFile={files.front} backFile={files.back} selfieFile={files.selfie} />
          )}
        </div>
      </FormProvider>

      {submission.status === "error" && (
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-err/10 text-err text-sm p-3">
          <HiExclamationCircle className="text-lg shrink-0 mt-0.5" />
          <span>{submission.message}</span>
        </div>
      )}

      <div className="flex justify-between gap-3">
        <Button variant="outline" onClick={handleBack} disabled={stepIndex === 0}>
          Back
        </Button>
        {isLastStep ? (
          <Button onClick={handleSubmit} disabled={submission.status === "submitting"}>
            {submission.status === "submitting"
              ? "Submitting..."
              : submission.status === "error"
                ? "Retry submission"
                : "Submit for review"}
          </Button>
        ) : (
          <Button onClick={handleContinue}>Continue</Button>
        )}
      </div>
    </Card>
  );
}
