import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "connect-src 'self' https:",
].join("; ");

/**
 * 전역 보안 헤더를 주입하고 API/개인화 경로의 검색 인덱싱을 차단한다.
 * @param request Next.js 미들웨어 요청 객체
 * @returns 보안 헤더가 반영된 응답
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const isHttps = request.nextUrl.protocol === "https:";
  const pathname = request.nextUrl.pathname;

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");

  if (pathname.startsWith("/api/") || pathname === "/watchlist") {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }

  if (isHttps) {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
