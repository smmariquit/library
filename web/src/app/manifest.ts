import type { MetadataRoute } from "next";
import { siteName } from "@/lib/metadata";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteName,
    short_name: "Library",
    description: "Upload, organize, and read your PDF books in one quiet shelf.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f1e8",
    theme_color: "#f6f1e8",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/icon-192.png", type: "image/png", sizes: "192x192", purpose: "maskable" },
      { src: "/icon-512.png", type: "image/png", sizes: "512x512", purpose: "maskable" },
    ],
  };
}
