import type { MetadataRoute } from "next";
import { OFFICIAL_SITE_URL } from "@/constants/messages";

const BASE = OFFICIAL_SITE_URL.replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      url: `${BASE}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE}/receber`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
