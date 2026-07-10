"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { HiArrowRight } from "react-icons/hi";
import Card from "./ui/Card";

interface CategoryCard {
  title: string;
  image: string;
  category?: string;
}

// `category` matches the slugs registered in book/[category]/page.tsx.
// "Cleaners" has no bookable category yet, so its card renders as
// non-interactive instead of linking anywhere — /book itself requires a
// login (it's the booking form, not a public category browser), so it's
// not a safe fallback destination for an unmapped category.
const categoryCards: CategoryCard[] = [
  { title: "Fashion Design", image: "/assets/taliologo.jpeg", category: "fashion" },
  { title: "Cleaners", image: "/assets/cleaning-icons.jpg" },
  { title: "Electrician", image: "/assets/electriciansmybol.jpeg", category: "electrical" },
  { title: "HairStylist", image: "/assets/hairStyl.png", category: "beauty_care" },
  { title: "Carpenter", image: "/assets/capenterLogo.png", category: "carpentry" },
  { title: "Photographer", image: "/assets/photograh.png", category: "photography" },
];

const featured = [
  { url: "/assets/tailo.jpeg", title: "Fashion Designer", category: "fashion" },
  { url: "/assets/plumb2.jpeg", title: "Plumber", category: "plumbing" },
  { url: "/assets/hairstylist.webp", title: "Hair Stylist", category: "beauty_care" },
];

export default function CategorySection() {
  const router = useRouter();

  return (
    <div id="categories" className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-8">
        <h2 className="font-heading text-2xl md:text-3xl font-semibold">Explore by category</h2>
        <p className="text-ink-500 mt-1">Real tradespeople, ready to work.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
        {categoryCards.map((card) =>
          card.category ? (
            <Card
              key={card.title}
              className="p-4 text-center cursor-pointer hover:border-brand-300 hover:shadow-md transition-all"
              onClick={() => router.push(`/book/${card.category}`)}
            >
              <div className="relative h-16 w-full mb-3">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 50vw, 16vw"
                />
              </div>
              <p className="font-medium text-sm text-ink-900">{card.title}</p>
              <span className="text-xs text-brand-500 inline-flex items-center gap-1 mt-1">
                View jobs <HiArrowRight />
              </span>
            </Card>
          ) : (
            <Card key={card.title} className="p-4 text-center opacity-60">
              <div className="relative h-16 w-full mb-3">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 50vw, 16vw"
                />
              </div>
              <p className="font-medium text-sm text-ink-900">{card.title}</p>
              <span className="text-xs text-ink-300 mt-1 inline-block">Coming soon</span>
            </Card>
          )
        )}
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {featured.map((image) => (
          <div
            key={image.title}
            className="relative h-[280px] rounded-2xl overflow-hidden group cursor-pointer"
            style={{ backgroundImage: `url(${image.url})`, backgroundSize: "cover", backgroundPosition: "center 40%" }}
            onClick={() => router.push(`/book/${image.category}`)}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/10 to-transparent" />
            <span className="absolute bottom-4 left-4 text-cream font-heading text-lg font-medium">
              {image.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
