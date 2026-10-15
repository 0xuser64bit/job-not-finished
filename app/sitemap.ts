import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/privacy", "/sign-in"].map((path) => ({ url: `${appUrl}${path}` }));
}
