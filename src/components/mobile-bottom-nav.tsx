"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/roles", label: "직무" },
  { href: "/briefings", label: "브리핑" },
  { href: "/scenarios/backend", label: "추천" },
  { href: "/compare", label: "비교" },
  { href: "/watchlist", label: "관심" },
];

/**
 * 모바일 하단 탭 내비게이션을 렌더링한다.
 * @returns 모바일 하단 메뉴
 */
export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-bottom-nav" aria-label="모바일 하단 메뉴">
      {tabs.map((tab) => {
        const active =
          pathname === tab.href ||
          (tab.href.startsWith("/scenarios") && pathname.startsWith("/scenarios")) ||
          (tab.href.startsWith("/trends") && pathname.startsWith("/trends"));

        return (
          <Link key={tab.href} href={tab.href} className={active ? "tab-active" : undefined}>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
