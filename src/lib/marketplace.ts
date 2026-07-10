/* Sample marketplace content for the redesigned marketing surfaces.
   Shapes stay compatible with the API categories in constants.ts /
   types.ts; the numbers here are illustrative Lagos content. */

export type CategoryKey =
  | "electrical"
  | "plumbing"
  | "beauty"
  | "carpentry"
  | "fashion"
  | "photography";

export interface CategoryMeta {
  key: CategoryKey;
  label: string;
  /** Matches the API's category enum (see lib/constants.ts). */
  apiCategory: string;
  count: number;
}

export const CATEGORIES: CategoryMeta[] = [
  { key: "electrical", label: "Electrical", apiCategory: "ELECTRICAL", count: 320 },
  { key: "plumbing", label: "Plumbing", apiCategory: "PLUMBING", count: 210 },
  { key: "beauty", label: "Beauty Care", apiCategory: "BEAUTY CARE", count: 540 },
  { key: "carpentry", label: "Carpentry", apiCategory: "CARPENTRY", count: 180 },
  { key: "fashion", label: "Fashion", apiCategory: "FASHION", count: 260 },
  { key: "photography", label: "Photography", apiCategory: "PHOTOGRAPHY", count: 140 },
];

export interface Worker {
  id: string;
  name: string;
  initials: string;
  /** Avatar background colour until real photos are wired in. */
  avatar: string;
  trade: string;
  area: string;
  rating: number;
  reviews: number;
  priceFrom: number;
  category: CategoryKey;
}

export const FEATURED_WORKERS: Worker[] = [
  { id: "gw-chidi", name: "Chidi O.", initials: "CO", avatar: "#c24a2a", trade: "Electrician", area: "Yaba", rating: 4.9, reviews: 128, priceFrom: 8000, category: "electrical" },
  { id: "gw-amara", name: "Amara N.", initials: "AN", avatar: "#7a4f9e", trade: "Fashion designer", area: "Surulere", rating: 5.0, reviews: 86, priceFrom: 25000, category: "fashion" },
  { id: "gw-tunde", name: "Tunde B.", initials: "TB", avatar: "#b9801f", trade: "Carpenter", area: "Ikeja", rating: 4.8, reviews: 204, priceFrom: 15000, category: "carpentry" },
  { id: "gw-bukola", name: "Bukola A.", initials: "BA", avatar: "#2a6e5a", trade: "Hair stylist", area: "Lekki", rating: 4.9, reviews: 312, priceFrom: 6500, category: "beauty" },
];

export const LAGOS_AREAS = [
  "Yaba, Lagos",
  "Ikeja, Lagos",
  "Surulere, Lagos",
  "Lekki, Lagos",
  "Victoria Island, Lagos",
  "Maryland, Lagos",
];

export const TRADES = [
  "Electrician",
  "Plumber",
  "Carpenter",
  "Hair stylist",
  "Fashion designer",
  "Photographer",
];

export function formatNaira(amount: number): string {
  return "₦" + amount.toLocaleString("en-NG");
}
