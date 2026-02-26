import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "직무핑",
  description: "직무별 기술 트렌드 데이터 리포트",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
