import EscrowFundingWizard from "@/components/escrow/EscrowFundingWizard";

interface EscrowFundingPageProps {
  params: Promise<{ bookingRef: string }>;
  searchParams: Promise<{ amount?: string; worker?: string }>;
}

export default async function EscrowFundingPage({ params, searchParams }: EscrowFundingPageProps) {
  const { bookingRef } = await params;
  const { amount, worker } = await searchParams;

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <span className="inline-block bg-navy/10 text-navy-2 text-xs font-semibold uppercase tracking-wide rounded-full px-3 py-1 mb-4">
        Escrow
      </span>
      <h1 className="font-heading text-3xl font-semibold">Fund your booking&apos;s escrow</h1>
      <p className="text-muted mt-2 mb-10 max-w-xl">
        A few quick steps to lock your payment in escrow. You can save your progress and come back
        any time before funding completes.
      </p>

      <EscrowFundingWizard
        bookingRef={decodeURIComponent(bookingRef)}
        amount={Number(amount) || 8800}
        workerName={worker ? decodeURIComponent(worker) : "your pro"}
      />
    </div>
  );
}
