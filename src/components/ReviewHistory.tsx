"use client";

import { useState, useMemo } from "react";
import { HiStar, HiChevronLeft, HiChevronRight } from "react-icons/hi";
import Card from "@/components/ui/Card";
import {
  getMockReviews,
  getMockReputationScore,
  REVIEW_CATEGORIES,
  type ReviewCategory,
} from "@/lib/reputation";

function ReviewCard({ review }: { review: import("@/lib/reputation").Review }) {
  return (
    <Card className="p-5 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-navy-tint flex items-center justify-center text-navy font-bold text-sm">
            {review.reviewerName.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">{review.reviewerName}</p>
            <p className="text-xs text-muted">{review.jobTitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }, (_, i) => (
            <HiStar
              key={i}
              size={14}
              className={i < review.rating ? "fill-gold text-gold" : "text-line"}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
      <p className="text-sm text-ink/80 leading-relaxed">{review.comment}</p>
      <time className="text-xs text-muted block">
        {new Date(review.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </time>
    </Card>
  );
}

export default function ReviewHistory() {
  const [category, setCategory] = useState<ReviewCategory>("all");
  const [page, setPage] = useState(1);

  const score = useMemo(() => getMockReputationScore(), []);
  const { reviews, totalPages, total } = useMemo(
    () => getMockReviews(category, page),
    [category, page]
  );

  const handleCategoryChange = (newCategory: ReviewCategory) => {
    setCategory(newCategory);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {REVIEW_CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => handleCategoryChange(cat.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              category === cat.value
                ? "bg-navy text-white"
                : "bg-line/50 text-muted hover:bg-line hover:text-ink"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Review list */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 text-muted">
          <p>No reviews found for this category.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-muted hover:text-ink hover:bg-line/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <HiChevronLeft size={16} />
            Previous
          </button>
          <span className="text-sm text-muted tabular-nums">
            Page {page} of {totalPages}
            <span className="ml-2 text-xs text-muted/60">({total} total)</span>
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-muted hover:text-ink hover:bg-line/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            Next
            <HiChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}