"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/roles", label: "직무" },
  { href: "/trends/backend", label: "트렌드" },
  { href: "/briefings", label: "브리핑" },
  { href: "/scenarios/backend", label: "상황추천" },
  { href: "/compare", label: "비교" },
  { href: "/watchlist", label: "관심리스트" },
  { href: "/insights", label: "인사이트" },
];

/**
 * 현재 경로를 기준으로 상단 내비게이션 활성 상태를 렌더링한다.
 * @returns 상단 메뉴 링크 목록
 */
export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="nav" aria-label="주요 메뉴">
      {navItems.map((item) => {
        const active =
          pathname === item.href ||
          (item.href.startsWith("/trends") && pathname.startsWith("/trends")) ||
          (item.href.startsWith("/scenarios") && pathname.startsWith("/scenarios"));

        return (
          <Link key={item.href} href={item.href} className={active ? "nav-active" : undefined}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
