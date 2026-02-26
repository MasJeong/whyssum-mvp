"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/roles", label: "직무" },
  { href: "/trends/backend", label: "트렌드" },
  { href: "/scenarios/backend", label: "상황추천" },
  { href: "/compare", label: "비교" },
  { href: "/insights", label: "인사이트" },
];

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
