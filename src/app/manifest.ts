import type { MetadataRoute } from "next";

/**
 * PWA 설치를 위한 웹 앱 매니페스트를 반환한다.
 * @returns 매니페스트 객체
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "왜씀?",
    short_name: "왜씀",
    description: "직무별 도구 선택 근거를 빠르게 확인하는 무료 데이터 플랫폼",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2d6fcb",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
