import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GuildWorkman — Book trusted local pros",
    short_name: "GuildWorkman",
    description:
      "Book vetted electricians, plumbers, carpenters and stylists near you — with payment held in on-chain escrow until the job is done.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf8f1",
    theme_color: "#1b2440",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        // The star sits inside the central 60%, so it survives the safe-zone crop.
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
