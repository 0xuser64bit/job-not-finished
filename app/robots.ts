import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard", "/settings", "/welcome", "/unsubscribe", "/verify-email"],
    },
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
