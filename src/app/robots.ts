import type { MetadataRoute } from "next";

/**
 * 서비스 공개 경로와 비공개 경로에 대한 robots 정책을 정의한다.
 * @returns robots 설정 객체
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/roles", "/trends/", "/scenarios/", "/compare", "/briefings", "/insights"],
      disallow: ["/api/", "/watchlist"],
    },
  };
}
