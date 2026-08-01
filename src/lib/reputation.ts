export interface Review {
  id: string;
  providerId: string;
  providerName: string;
  rating: number;
  comment: string;
  reviewerName: string;
  jobTitle: string;
  createdAt: string; // ISO date string
  category: "cleanliness" | "punctuality" | "quality" | "communication" | "overall";
}

export interface ReputationScore {
  overall: number;
  totalReviews: number;
  fiveStar: number;
  fourStar: number;
  threeStar: number;
  twoStar: number;
  oneStar: number;
  categories: {
    cleanliness: number;
    punctuality: number;
    quality: number;
    communication: number;
  };
}

export type ReviewCategory = Review["category"] | "all";

export const REVIEW_CATEGORIES: { value: ReviewCategory; label: string }[] = [
  { value: "all", label: "All Reviews" },
  { value: "overall", label: "Overall" },
  { value: "quality", label: "Quality" },
  { value: "punctuality", label: "Punctuality" },
  { value: "communication", label: "Communication" },
  { value: "cleanliness", label: "Cleanliness" },
];

const REVIEWS_PER_PAGE = 5;

const MOCK_REVIEWS: Review[] = [
  {
    id: "rev-001",
    providerId: "pro-1",
    providerName: "Grace Akinyi",
    rating: 5,
    comment: "Excellent work! Grace rewired our entire living room and did a fantastic job. Very professional and clean.",
    reviewerName: "James Mwangi",
    jobTitle: "Electrical Rewiring",
    createdAt: "2026-07-28T10:30:00Z",
    category: "quality",
  },
  {
    id: "rev-002",
    providerId: "pro-1",
    providerName: "Grace Akinyi",
    rating: 5,
    comment: "Arrived on time, finished ahead of schedule. Highly recommended for any electrical work.",
    reviewerName: "Sarah Wanjiku",
    jobTitle: "Outlet Installation",
    createdAt: "2026-07-25T14:15:00Z",
    category: "punctuality",
  },
  {
    id: "rev-003",
    providerId: "pro-1",
    providerName: "Grace Akinyi",
    rating: 4,
    comment: "Good work overall. The wiring was done well, though there was some dust left behind. Would hire again.",
    reviewerName: "Peter Kamau",
    jobTitle: "Home Rewiring",
    createdAt: "2026-07-20T09:00:00Z",
    category: "cleanliness",
  },
  {
    id: "rev-004",
    providerId: "pro-1",
    providerName: "Grace Akinyi",
    rating: 5,
    comment: "Grace explained everything clearly before starting. Very transparent pricing and great communication.",
    reviewerName: "Faith Nyambura",
    jobTitle: "Security Light Installation",
    createdAt: "2026-07-18T16:45:00Z",
    category: "communication",
  },
  {
    id: "rev-005",
    providerId: "pro-1",
    providerName: "Grace Akinyi",
    rating: 3,
    comment: "The work was fine but took longer than expected. The quality was acceptable.",
    reviewerName: "David Ochieng",
    jobTitle: "Ceiling Fan Installation",
    createdAt: "2026-07-15T11:20:00Z",
    category: "quality",
  },
  {
    id: "rev-006",
    providerId: "pro-1",
    providerName: "Grace Akinyi",
    rating: 5,
    comment: "Best electrician I've ever hired! Very thorough and safety-conscious. My family feels much safer now.",
    reviewerName: "Mary Atieno",
    jobTitle: "Full House Rewiring",
    createdAt: "2026-07-12T08:30:00Z",
    category: "overall",
  },
  {
    id: "rev-007",
    providerId: "pro-1",
    providerName: "Grace Akinyi",
    rating: 4,
    comment: "Professional service. Cleaned up after herself and the work passed inspection without issues.",
    reviewerName: "John Kiprop",
    jobTitle: "Circuit Panel Upgrade",
    createdAt: "2026-07-08T13:00:00Z",
    category: "cleanliness",
  },
  {
    id: "rev-008",
    providerId: "pro-1",
    providerName: "Grace Akinyi",
    rating: 5,
    comment: "Grace was very responsive to messages and accommodated our tight schedule. Outstanding communication.",
    reviewerName: "Lucy Wambui",
    jobTitle: "Emergency Electrical Repair",
    createdAt: "2026-07-05T19:15:00Z",
    category: "communication",
  },
];

export function getMockReputationScore(): ReputationScore {
  const reviews = MOCK_REVIEWS;
  const total = reviews.length;
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / total;

  const catReviews = reviews.filter((r) => r.category !== "overall");
  const byCategory = (cat: Review["category"]) => {
    const filtered = catReviews.filter((r) => r.category === cat);
    if (filtered.length === 0) return 0;
    return filtered.reduce((sum, r) => sum + r.rating, 0) / filtered.length;
  };

  return {
    overall: Math.round(avg * 10) / 10,
    totalReviews: total,
    fiveStar: reviews.filter((r) => r.rating === 5).length,
    fourStar: reviews.filter((r) => r.rating === 4).length,
    threeStar: reviews.filter((r) => r.rating === 3).length,
    twoStar: reviews.filter((r) => r.rating === 2).length,
    oneStar: reviews.filter((r) => r.rating === 1).length,
    categories: {
      cleanliness: Math.round(byCategory("cleanliness") * 10) / 10,
      punctuality: Math.round(byCategory("punctuality") * 10) / 10,
      quality: Math.round(byCategory("quality") * 10) / 10,
      communication: Math.round(byCategory("communication") * 10) / 10,
    },
  };
}

export function getMockReviews(
  category: ReviewCategory = "all",
  page: number = 1
): { reviews: Review[]; totalPages: number; total: number } {
  const filtered =
    category === "all"
      ? MOCK_REVIEWS
      : MOCK_REVIEWS.filter((r) => r.category === category);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / REVIEWS_PER_PAGE));
  const start = (page - 1) * REVIEWS_PER_PAGE;
  const paged = filtered.slice(start, start + REVIEWS_PER_PAGE);

  return { reviews: paged, totalPages, total };
}