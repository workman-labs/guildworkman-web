import { getMockReputationScore } from "@/lib/reputation";
import ReputationScoreCard from "@/components/ReputationScoreCard";
import ReviewHistory from "@/components/ReviewHistory";

export default function ReputationPage() {
  const score = getMockReputationScore();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-navy">Reputation Dashboard</h1>
        <p className="text-muted mt-1">
          View your aggregate reputation score and browse through provider reviews.
        </p>
      </div>

      {/* Layout: Score Card + Review History */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">
        <aside className="space-y-6">
          <ReputationScoreCard score={score} />
        </aside>
        <section>
          <h2 className="text-xl font-semibold text-ink mb-4">Review History</h2>
          <ReviewHistory />
        </section>
      </div>
    </div>
  );
}