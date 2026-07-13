import type { MetadataRoute } from "next";
import { siteURL } from "@/lib/metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/forgot-password", "/library", "/login", "/reset-password", "/signup", "/verify"],
    },
    sitemap: new URL("/sitemap.xml", siteURL).toString(),
  };
}
