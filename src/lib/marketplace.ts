/* Sample marketplace content for the redesigned surfaces. Shapes stay
   compatible with the API categories in constants.ts / types.ts; the
   numbers here are illustrative Lagos content until the app is wired to
   skilledWorker/nearby + the category list. */

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
  fromPrice: number;
}

export const CATEGORIES: CategoryMeta[] = [
  { key: "electrical", label: "Electrical", apiCategory: "ELECTRICAL", count: 320, fromPrice: 8000 },
  { key: "plumbing", label: "Plumbing", apiCategory: "PLUMBING", count: 210, fromPrice: 6000 },
  { key: "beauty", label: "Beauty Care", apiCategory: "BEAUTY_CARE", count: 540, fromPrice: 3500 },
  { key: "carpentry", label: "Carpentry", apiCategory: "CARPENTRY", count: 180, fromPrice: 12000 },
  { key: "fashion", label: "Fashion", apiCategory: "FASHION", count: 260, fromPrice: 15000 },
  { key: "photography", label: "Photography", apiCategory: "PHOTOGRAPHY", count: 140, fromPrice: 20000 },
];

export function getCategory(key: string): CategoryMeta | undefined {
  return CATEGORIES.find((c) => c.key === key);
}

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
  specialties: string[];
  /** Distance from the client's chosen area, km (illustrative). */
  distanceKm: number;
  featured?: boolean;
}

export const WORKERS: Worker[] = [
  // Electrical
  { id: "gw-chidi", name: "Chidi O.", initials: "CO", avatar: "#c24a2a", trade: "Electrician", area: "Yaba", rating: 4.9, reviews: 128, priceFrom: 8000, category: "electrical", specialties: ["Wiring", "Fault repair", "Inverters"], distanceKm: 1.2, featured: true },
  { id: "gw-ngozi", name: "Ngozi A.", initials: "NA", avatar: "#2a6e5a", trade: "Electrician", area: "Yaba", rating: 5.0, reviews: 63, priceFrom: 10000, category: "electrical", specialties: ["Rewiring", "Solar"], distanceKm: 0.8 },
  { id: "gw-emeka", name: "Emeka I.", initials: "EI", avatar: "#b9801f", trade: "Electrician", area: "Surulere", rating: 4.7, reviews: 204, priceFrom: 7500, category: "electrical", specialties: ["Sockets", "Repairs"], distanceKm: 3.1 },
  { id: "gw-musa", name: "Musa D.", initials: "MD", avatar: "#7a4f9e", trade: "Electrician", area: "Ikeja", rating: 4.8, reviews: 151, priceFrom: 9000, category: "electrical", specialties: ["Industrial", "Fault repair"], distanceKm: 5.4 },
  { id: "gw-femi", name: "Femi B.", initials: "FB", avatar: "#2a3a66", trade: "Electrician", area: "Lekki", rating: 4.9, reviews: 240, priceFrom: 12000, category: "electrical", specialties: ["Solar", "Inverters", "Rewiring"], distanceKm: 8.0 },
  // Plumbing
  { id: "gw-kunle", name: "Kunle S.", initials: "KS", avatar: "#2a6e5a", trade: "Plumber", area: "Surulere", rating: 4.8, reviews: 96, priceFrom: 6000, category: "plumbing", specialties: ["Leaks", "Fittings"], distanceKm: 2.4 },
  { id: "gw-ibrahim", name: "Ibrahim Y.", initials: "IY", avatar: "#b9801f", trade: "Plumber", area: "Ikeja", rating: 4.6, reviews: 132, priceFrom: 7000, category: "plumbing", specialties: ["Drainage", "Water heaters"], distanceKm: 4.9 },
  { id: "gw-chioma", name: "Chioma E.", initials: "CE", avatar: "#7a4f9e", trade: "Plumber", area: "Yaba", rating: 4.9, reviews: 78, priceFrom: 8500, category: "plumbing", specialties: ["Bathrooms", "Pipework"], distanceKm: 1.6 },
  // Beauty
  { id: "gw-bukola", name: "Bukola A.", initials: "BA", avatar: "#2a6e5a", trade: "Hair stylist", area: "Lekki", rating: 4.9, reviews: 312, priceFrom: 6500, category: "beauty", specialties: ["Braids", "Locs", "Gele"], distanceKm: 8.0, featured: true },
  { id: "gw-tolu", name: "Tolu F.", initials: "TF", avatar: "#c24a2a", trade: "Makeup artist", area: "Yaba", rating: 5.0, reviews: 145, priceFrom: 12000, category: "beauty", specialties: ["Bridal", "Editorial"], distanceKm: 1.1 },
  { id: "gw-halima", name: "Halima B.", initials: "HB", avatar: "#b9801f", trade: "Barber", area: "Surulere", rating: 4.7, reviews: 210, priceFrom: 3500, category: "beauty", specialties: ["Fades", "Beard work"], distanceKm: 3.0 },
  // Carpentry
  { id: "gw-tunde", name: "Tunde B.", initials: "TB", avatar: "#b9801f", trade: "Carpenter", area: "Ikeja", rating: 4.8, reviews: 204, priceFrom: 15000, category: "carpentry", specialties: ["Furniture", "Fittings"], distanceKm: 5.4, featured: true },
  { id: "gw-segun", name: "Segun O.", initials: "SO", avatar: "#2a3a66", trade: "Carpenter", area: "Yaba", rating: 4.7, reviews: 88, priceFrom: 12000, category: "carpentry", specialties: ["Wardrobes", "Doors"], distanceKm: 1.9 },
  { id: "gw-grace", name: "Grace N.", initials: "GN", avatar: "#7a4f9e", trade: "Carpenter", area: "Maryland", rating: 4.9, reviews: 121, priceFrom: 18000, category: "carpentry", specialties: ["Cabinets", "Bespoke"], distanceKm: 4.2 },
  // Fashion
  { id: "gw-amara", name: "Amara N.", initials: "AN", avatar: "#7a4f9e", trade: "Fashion designer", area: "Surulere", rating: 5.0, reviews: 86, priceFrom: 25000, category: "fashion", specialties: ["Bridal", "Ankara", "Tailoring"], distanceKm: 3.1, featured: true },
  { id: "gw-zainab", name: "Zainab O.", initials: "ZO", avatar: "#c24a2a", trade: "Fashion designer", area: "Lekki", rating: 4.8, reviews: 64, priceFrom: 30000, category: "fashion", specialties: ["Agbada", "Ready-to-wear"], distanceKm: 7.5 },
  { id: "gw-ada", name: "Ada M.", initials: "AM", avatar: "#2a6e5a", trade: "Tailor", area: "Yaba", rating: 4.9, reviews: 152, priceFrom: 10000, category: "fashion", specialties: ["Alterations", "Native"], distanceKm: 1.4 },
  // Photography
  { id: "gw-ife", name: "Ife K.", initials: "IK", avatar: "#2a3a66", trade: "Photographer", area: "Lekki", rating: 4.9, reviews: 98, priceFrom: 20000, category: "photography", specialties: ["Events", "Portrait"], distanceKm: 7.8 },
  { id: "gw-sola", name: "Sola A.", initials: "SA", avatar: "#b9801f", trade: "Photographer", area: "Yaba", rating: 4.7, reviews: 55, priceFrom: 18000, category: "photography", specialties: ["Weddings", "Studio"], distanceKm: 1.3 },
  { id: "gw-uche", name: "Uche P.", initials: "UP", avatar: "#c24a2a", trade: "Videographer", area: "Ikeja", rating: 5.0, reviews: 41, priceFrom: 35000, category: "photography", specialties: ["Cinematic", "Drone"], distanceKm: 5.0 },
];

/** Highest-rated first — the default "Top rated" browse order. */
export function getWorkersByCategory(key: CategoryKey): Worker[] {
  return WORKERS.filter((w) => w.category === key).sort((a, b) => b.rating - a.rating);
}

export function getWorkerById(id: string): Worker | undefined {
  return WORKERS.find((w) => w.id === id);
}

/** Curated set for the landing page. */
export const FEATURED_WORKERS: Worker[] = ["gw-chidi", "gw-amara", "gw-tunde", "gw-bukola"]
  .map((id) => getWorkerById(id))
  .filter((w): w is Worker => Boolean(w));

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
