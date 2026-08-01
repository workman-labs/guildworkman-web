import DisputeForm from "@/components/DisputeForm";

export default function DisputePage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <span className="inline-block bg-terra/10 text-terra-deep text-xs font-semibold uppercase tracking-wide rounded-full px-3 py-1 mb-4">
        Support
      </span>
      <h1 className="font-heading text-3xl font-semibold">File a dispute</h1>
      <p className="text-muted mt-2 mb-10 max-w-xl">
        If something went wrong with a booking, let us know. We&apos;ll review
        the case and help both parties reach a fair resolution.
      </p>

      <DisputeForm />
    </div>
  );
}