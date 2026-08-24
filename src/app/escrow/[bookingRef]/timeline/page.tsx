import EscrowTimelinePanel from "@/components/escrow/EscrowTimelinePanel";

interface EscrowTimelinePageProps {
  params: Promise<{ bookingRef: string }>;
  searchParams: Promise<{ worker?: string; fundedAt?: string }>;
}

export default async function EscrowTimelinePage({ params, searchParams }: EscrowTimelinePageProps) {
  const { bookingRef } = await params;
  const { worker, fundedAt } = await searchParams;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <span className="mb-4 inline-block rounded-full bg-navy/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-navy-2">
        Escrow
      </span>
      <h1 className="font-heading text-3xl font-semibold">Escrow status timeline</h1>
      <p className="mb-10 mt-2 max-w-xl text-muted">
        Track your booking&apos;s escrow live as it moves through its on-chain lifecycle. Actions
        appear instantly and confirm — or roll back — as the Stellar network settles them.
      </p>

      <EscrowTimelinePanel
        bookingRef={decodeURIComponent(bookingRef)}
        workerName={worker ? decodeURIComponent(worker) : "your pro"}
        fundedAt={fundedAt ?? new Date().toISOString()}
      />
    </div>
  );
}
