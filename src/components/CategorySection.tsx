"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { HiArrowRight } from "react-icons/hi";

interface CategoryCard {
  title: string;
  image: string;
}

const categoryCards: CategoryCard[] = [
  { title: "Fashion Design", image: "/assets/taliologo.jpeg" },
  { title: "Cleaners", image: "/assets/cleaning-icons.jpg" },
  { title: "Electrician", image: "/assets/electriciansmybol.jpeg" },
  { title: "HairStylist", image: "/assets/hairStyl.png" },
  { title: "Carpenter", image: "/assets/capenterLogo.png" },
  { title: "Photographer", image: "/assets/photograh.png" },
];

const featured = [
  { url: "/assets/tailo.jpeg", title: "Fashion Designer" },
  { url: "/assets/plumb2.jpeg", title: "Plumber" },
  { url: "/assets/hairstylist.webp", title: "Hair Stylist" },
];

export default function CategorySection() {
  const router = useRouter();

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h3 className="text-2xl font-semibold mb-6">Explore by category</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {categoryCards.map((card) => (
          <div key={card.title} className="border rounded-lg p-4 text-center">
            <div className="relative h-20 w-full mb-2">
              <Image
                src={card.image}
                alt={card.title}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
            <p className="font-medium">{card.title}</p>
            <button
              className="text-sm text-blue-600 inline-flex items-center gap-1 mt-1"
              onClick={() => router.push("/book")}
            >
              available jobs <HiArrowRight />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {featured.map((image) => (
          <div
            key={image.title}
            className="relative flex-1 min-w-[150px] h-[250px] border-2 border-slate-200 overflow-hidden group cursor-pointer"
            style={{ backgroundImage: `url(${image.url})`, backgroundSize: "cover", backgroundPosition: "center 40%" }}
          >
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <span className="text-white font-medium border-b-2 border-transparent group-hover:border-white pb-1">
                {image.title}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
