"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import type { Map as LeafletMap } from "leaflet";

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
}

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
      <div id="map" className="h-[500px] w-full" />

      <div className="flex flex-col md:flex-row items-center justify-between gap-8 px-6 py-12 max-w-6xl mx-auto">
        <div className="max-w-xl">
          <h1 className="text-4xl font-bold leading-tight">
            Discover more than 5000{" "}
            <span className="text-blue-600">skilled workers</span>
          </h1>
          <p className="mt-4 text-slate-600">
            Great platform for job seekers searching for new career heights and passionate about
            making people happy.
          </p>
          <Button
            variant="contained"
            sx={{ fontSize: "1.1rem", padding: "12px 24px", borderRadius: "8px", mt: 3 }}
            onClick={() => router.push("/appoint")}
          >
            Discover Now
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2 max-w-md">
          <img src="/assets/fashiondesigner.jpg" alt="Fashion Designer" className="rounded-lg object-cover h-32 w-full" />
          <img src="/assets/Skill.png" alt="Skill" className="rounded-lg object-cover h-32 w-full" />
          <img src="/assets/hairstylist.jpg" alt="Hairstylist" className="rounded-lg object-cover h-32 w-full" />
          <img src="/assets/barber.jpg" alt="Barber" className="rounded-lg object-cover h-32 w-full" />
          <img src="/assets/plumb1.jpeg" alt="Plumber" className="rounded-lg object-cover h-32 w-full" />
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 pb-12">
        <Paper
          component="form"
          onSubmit={handleSearch}
          sx={{ p: "2px 4px", display: "flex", alignItems: "center", width: "100%" }}
        >
          <IconButton sx={{ p: "10px" }} aria-label="menu">
            <MenuIcon />
          </IconButton>
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search for a location"
            inputProps={{ "aria-label": "search locations" }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <IconButton type="submit" sx={{ p: "10px" }} aria-label="search">
            <SearchIcon />
          </IconButton>
          <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
        </Paper>

        {searchResults.length > 0 && (
          <ul className="mt-2 divide-y divide-slate-200 bg-white rounded-md shadow">
            {searchResults.map((result) => (
              <li
                key={result.place_id}
                className="p-2 text-sm cursor-pointer hover:bg-slate-50"
                onClick={() => handleLocationClick(result.lat, result.lon, result.display_name)}
              >
                {result.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
