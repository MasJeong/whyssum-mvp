"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
