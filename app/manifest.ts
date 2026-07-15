import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "iMessage Faker",
    short_name: "iMessage Faker",
    description: "Générateur de fausses conversations iMessage, fidèles à l'interface iPhone.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f2f2f5",
    theme_color: "#ffffff",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
