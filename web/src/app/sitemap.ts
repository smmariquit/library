import type { MetadataRoute } from "next";
import { siteURL } from "@/lib/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: siteURL.toString(), changeFrequency: "monthly", priority: 1 }];
}
