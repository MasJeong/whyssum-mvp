import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

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
            <Link href="/" className="brand">
              왜씀?
            </Link>
            <nav className="nav">
              <Link href="/roles">직무</Link>
              <Link href="/trends/backend">트렌드</Link>
              <Link href="/scenarios/backend">상황추천</Link>
              <Link href="/compare">비교</Link>
              <Link href="/insights">인사이트</Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
