import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/roles", "/trends/", "/scenarios/", "/compare", "/briefings", "/insights"],
      disallow: ["/api/", "/watchlist"],
    },
  };
}
