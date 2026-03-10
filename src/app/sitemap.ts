import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const roles = ["backend", "designer", "pm"];

/**
 * 검색엔진 크롤링을 위한 사이트맵을 생성한다.
 * @returns 사이트맵 URL 목록
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["", "/roles", "/compare", "/briefings", "/insights", "/watchlist", "/advertising", "/privacy"];
  const dynamicPaths = roles.flatMap((role) => [`/trends/${role}`, `/scenarios/${role}`]);

  return [...staticPaths, ...dynamicPaths].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : path.startsWith("/trends") || path.startsWith("/scenarios") ? 0.9 : 0.7,
  }));
}
