"use client";

import { HiStar } from "react-icons/hi";
import Card from "@/components/ui/Card";
import type { ReputationScore } from "@/lib/reputation";

interface ReputationScoreCardProps {
  score: ReputationScore;
}

function StarRating({ value, max = 5 }: { value: number; max?: number }) {
  const full = Math.floor(value);
  const hasHalf = value - full >= 0.25;
  const stars = [];

  for (let i = 1; i <= max; i++) {
    if (i <= full) {
      stars.push(
        <HiStar key={i} size={18} className="fill-gold text-gold" aria-hidden="true" />
      );
    } else if (i === full + 1 && hasHalf) {
      stars.push(
        <span key={i} className="relative" aria-hidden="true">
          <HiStar size={18} className="text-line" />
          <span className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
            <HiStar size={18} className="fill-gold text-gold" />
          </span>
        </span>
      );
    } else {
      stars.push(
        <HiStar key={i} size={18} className="text-line" aria-hidden="true" />
      );
    }
  }

  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`${value} out of ${max} stars`}>
      {stars}
    </div>
  );
}

function CategoryBar({ label, value }: { label: string; value: number }) {
  const pct = (value / 5) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 text-sm text-muted shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-line overflow-hidden">
        <div
          className="h-full rounded-full bg-gold transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-right text-sm font-semibold text-ink tabular-nums">
        {value.toFixed(1)}
      </span>
    </div>
  );
}

export default function ReputationScoreCard({ score }: ReputationScoreCardProps) {
  return (
    <Card className="p-6 space-y-6">
      {/* Overall Score */}
      <div className="text-center">
        <div className="text-5xl font-bold text-navy tabular-nums">{score.overall}</div>
        <StarRating value={score.overall} />
        <p className="text-sm text-muted mt-1">
          Based on {score.totalReviews} review{score.totalReviews !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Rating Distribution */}
      <div className="space-y-1.5">
        {[
          { label: "5★", count: score.fiveStar },
          { label: "4★", count: score.fourStar },
          { label: "3★", count: score.threeStar },
          { label: "2★", count: score.twoStar },
          { label: "1★", count: score.oneStar },
        ].map(({ label, count }) => {
          const pct = score.totalReviews > 0 ? (count / score.totalReviews) * 100 : 0;
          return (
            <div key={label} className="flex items-center gap-2 text-sm">
              <span className="w-8 text-muted">{label}</span>
              <div className="flex-1 h-2 rounded-full bg-line overflow-hidden">
                <div
                  className="h-full rounded-full bg-navy/60 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-8 text-right text-muted tabular-nums">{count}</span>
            </div>
          );
        })}
      </div>

      {/* Category Breakdown */}
      <div className="pt-4 border-t border-line space-y-3">
        <h4 className="text-sm font-semibold text-ink/80 uppercase tracking-wide">
          By Category
        </h4>
        <CategoryBar label="Quality" value={score.categories.quality} />
        <CategoryBar label="Punctuality" value={score.categories.punctuality} />
        <CategoryBar label="Communication" value={score.categories.communication} />
        <CategoryBar label="Cleanliness" value={score.categories.cleanliness} />
      </div>
    </Card>
  );
}