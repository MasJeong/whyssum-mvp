"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * 상황추천 진입을 돕는 모바일 고정 CTA를 노출한다.
 * @returns CTA 링크 또는 null
 */
export default function MobileStickyCta() {
  const pathname = usePathname();

  if (pathname.startsWith("/scenarios")) {
    return null;
  }

  return (
    <Link href="/scenarios/backend" className="mobile-sticky-cta">
      상황추천 시작하기
    </Link>
  );
}
