import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import MobileBottomNav from "@/components/mobile-bottom-nav";
import NavLinks from "@/components/nav-links";

export const metadata: Metadata = {
  title: "왜씀?",
  description: "직무별 도구 선택의 이유를 보여주는 가벼운 데이터 플랫폼",
};

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
        <Link href="/scenarios/backend" className="mobile-sticky-cta">
          상황추천 시작하기
        </Link>
        <MobileBottomNav />
        <footer className="container site-footer">왜씀? MVP · 공개 데이터 구조 기반 의사결정 실험</footer>
      </body>
    </html>
  );
}
