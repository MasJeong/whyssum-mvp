"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "홈" },
  { href: "/roles", label: "직무" },
  { href: "/scenarios/backend", label: "추천" },
  { href: "/compare", label: "비교" },
  { href: "/insights", label: "인사이트" },
];

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
