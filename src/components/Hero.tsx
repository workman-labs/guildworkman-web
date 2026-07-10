"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { HiSearch } from "react-icons/hi";
import type { Map as LeafletMap } from "leaflet";
import Button from "./ui/Button";
import Card from "./ui/Card";

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
}

const collage = [
  { src: "/assets/fashiondesigner.jpg", alt: "Fashion Designer" },
  { src: "/assets/Skill.png", alt: "Skill" },
  { src: "/assets/hairstylist.jpg", alt: "Hairstylist" },
  { src: "/assets/barber.jpg", alt: "Barber" },
];

export default function Hero() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    if (mapRef.current) return;

    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || mapRef.current) return;

      const mapInstance = L.map("map").setView([39.75621, -104.99404], 13);
      mapRef.current = mapInstance;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapInstance);

      mapInstance.locate({ setView: true, maxZoom: 16 });

      mapInstance.on("locationfound", (e) => {
        const radius = e.accuracy / 2;
        L.marker(e.latlng)
          .addTo(mapInstance)
          .bindPopup(`You are within ${radius} meters from this point.`)
          .openPopup();
        L.circle(e.latlng, radius).addTo(mapInstance);
      });

      mapInstance.on("locationerror", () => {
        console.warn("Location access denied.");
      });
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim() === "") return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchTerm)}&format=json&limit=5`
      );
      setSearchResults(await response.json());
    } catch (error) {
      console.error("Error fetching the location:", error);
    }
  };

  const handleLocationClick = async (lat: string, lon: string, displayName: string) => {
    if (!mapRef.current) return;
    const L = await import("leaflet");
    mapRef.current.setView([Number(lat), Number(lon)], 13);
    L.marker([Number(lat), Number(lon)]).addTo(mapRef.current).bindPopup(displayName).openPopup();
  };

  return (
    <div>
      <section className="bg-ink-900 text-cream">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block bg-gold-100 text-gold-600 text-xs font-semibold uppercase tracking-wide rounded-full px-3 py-1 mb-5">
              Trusted local trades
            </span>
            <h1 className="font-heading text-4xl md:text-5xl font-semibold leading-[1.1]">
              Find skilled workers <span className="text-brand-300">you can trust</span>
            </h1>
            <p className="mt-5 text-ink-100 text-lg max-w-md leading-relaxed">
              Discover more than 5,000 electricians, plumbers, stylists and
              other tradespeople — book with confidence and get the job done
              right.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={() =>
                  document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Discover Now
              </Button>
              <Button variant="outline-inverse" size="lg" onClick={() => router.push("/skilWok")}>
                Join as a worker
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 grid-rows-2 gap-3 h-80 w-full">
            {collage.map((image) => (
              <div key={image.src} className="relative rounded-2xl overflow-hidden">
                <Image src={image.src} alt={image.alt} fill priority className="object-cover" sizes="(max-width: 768px) 45vw, 260px" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 -mt-8 relative z-10">
        <Card className="p-2">
          <form onSubmit={handleSearch} className="flex items-center gap-2 px-3 py-2">
            <HiSearch className="text-ink-300 text-xl shrink-0" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for a location near you"
              aria-label="search locations"
              className="flex-1 min-w-0 outline-none text-ink-900 placeholder:text-ink-300 py-2"
            />
            <Button type="submit" size="sm">
              Search
            </Button>
          </form>
        </Card>

        {searchResults.length > 0 && (
          <ul className="mt-2 divide-y divide-ink-100 bg-white rounded-xl shadow-lg overflow-hidden">
            {searchResults.map((result) => (
              <li
                key={result.place_id}
                className="p-3 text-sm cursor-pointer hover:bg-cream-100"
                onClick={() => handleLocationClick(result.lat, result.lon, result.display_name)}
              >
                {result.display_name}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div id="map" className="h-[400px] w-full mt-10" />
    </div>
  );
}
