import IdentityVerificationWizard from "@/components/identity/IdentityVerificationWizard";

export default function VerifyIdentityPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <span className="inline-block bg-terra/10 text-terra-deep text-xs font-semibold uppercase tracking-wide rounded-full px-3 py-1 mb-4">
        Onboarding
      </span>
      <h1 className="font-heading text-3xl font-semibold">Verify your identity</h1>
      <p className="text-muted mt-2 mb-10 max-w-xl">
        A few quick steps to confirm who you are. You can save your progress and come back any
        time before submitting.
      </p>

      <IdentityVerificationWizard />
    </div>
  );
}
