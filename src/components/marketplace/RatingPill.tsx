import NorthStar from "@/components/brand/NorthStar";

interface RatingPillProps {
  rating: number;
  reviews?: number;
  className?: string;
}

/** Gold rating pill built on the North Star — the score and the brand
    are literally the same shape. */
export default function RatingPill({ rating, reviews, className = "" }: RatingPillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-2.5 py-1 text-sm font-extrabold text-gold-deep tabular-nums ${className}`}
    >
      <NorthStar size={13} color="currentColor" />
      {rating.toFixed(1)}
      {reviews != null ? (
        <span className="font-medium opacity-70">·{reviews}</span>
      ) : null}
    </span>
  );
}
