import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import MobileBottomNav from "@/components/mobile-bottom-nav";
import MobileStickyCta from "@/components/mobile-sticky-cta";
import NavLinks from "@/components/nav-links";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "왜씀? | 직무별 도구 선택 근거 플랫폼",
    template: "%s | 왜씀?",
  },
  description: "직무별 트렌드·상황추천·비교를 연결해 팀 의사결정 시간을 줄이는 무료 데이터 플랫폼",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    siteName: "왜씀?",
    title: "왜씀? | 직무별 도구 선택 근거 플랫폼",
    description: "직무별 트렌드·상황추천·비교를 연결해 팀 의사결정 시간을 줄이는 무료 데이터 플랫폼",
  },
  twitter: {
    card: "summary_large_image",
    title: "왜씀? | 직무별 도구 선택 근거 플랫폼",
    description: "직무별 트렌드·상황추천·비교를 연결해 팀 의사결정 시간을 줄이는 무료 데이터 플랫폼",
  },
};

/**
 * 전체 페이지 공통 레이아웃(헤더/푸터/모바일 내비게이션)을 구성한다.
 * @param children 각 라우트 페이지 콘텐츠
 * @returns 루트 레이아웃
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <header className="site-header">
          <div className="container header-inner">
            <Link href="/" className="brand-wrap">
              <span className="brand">왜씀?</span>
              <span className="brand-sub">직무별 선택 이유를 빠르게</span>
            </Link>
            <NavLinks />
          </div>
        </header>
        {children}
        <MobileStickyCta />
        <MobileBottomNav />
        <footer className="container site-footer">
          <div className="footer-grid">
            <div>
              <strong>왜씀?</strong>
              <p>직무별 선택 이유를 빠르게 확인하는 데이터 가이드</p>
            </div>
            <div className="footer-links">
              <Link href="/roles">직무</Link>
              <Link href="/trends/backend">트렌드</Link>
              <Link href="/briefings">브리핑</Link>
              <Link href="/scenarios/backend">상황추천</Link>
              <Link href="/watchlist">관심리스트</Link>
              <Link href="/growth">성장 대시보드</Link>
              <Link href="/insights">인사이트</Link>
              <Link href="/feed.xml">RSS</Link>
              <Link href="/advertising">광고 안내</Link>
              <Link href="/privacy">개인정보 안내</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
