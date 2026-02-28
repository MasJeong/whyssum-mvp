import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import MobileBottomNav from "@/components/mobile-bottom-nav";
import MobileStickyCta from "@/components/mobile-sticky-cta";
import NavLinks from "@/components/nav-links";

export const metadata: Metadata = {
  title: "왜씀?",
  description: "직무별 도구 선택의 이유를 보여주는 가벼운 데이터 플랫폼",
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
              <Link href="/insights">인사이트</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
