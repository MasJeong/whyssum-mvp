"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/roles",
    label: "직무",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="8" r="2.5" />
        <path d="M4.5 17c.7-2.1 2.4-3.2 4.5-3.2s3.8 1.1 4.5 3.2" />
        <circle cx="16.8" cy="9" r="1.8" />
        <path d="M14.8 16.8c.4-1.5 1.6-2.3 3.1-2.3" />
      </svg>
    ),
  },
  {
    href: "/trends/backend",
    label: "트렌드",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19h16" />
        <path d="M7 16V9" />
        <path d="M12 16V6" />
        <path d="M17 16v-4" />
      </svg>
    ),
  },
  {
    href: "/briefings",
    label: "브리핑",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="4" width="14" height="16" rx="2" />
        <path d="M9 9h6" />
        <path d="M9 13h6" />
      </svg>
    ),
  },
  {
    href: "/scenarios/backend",
    label: "상황추천",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 4.5l1.9 3.8 4.2.6-3 2.9.7 4.2L12 14l-3.8 2 0.7-4.2-3-2.9 4.2-.6L12 4.5z" />
      </svg>
    ),
  },
  {
    href: "/compare",
    label: "비교",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="6" width="5" height="12" rx="1.2" />
        <rect x="14" y="6" width="5" height="12" rx="1.2" />
      </svg>
    ),
  },
  {
    href: "/watchlist",
    label: "관심리스트",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 5.5h10v13l-5-2.7-5 2.7v-13z" />
      </svg>
    ),
  },
  {
    href: "/insights",
    label: "인사이트",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 4.8a5.5 5.5 0 0 0-3.3 9.9c.7.5 1.3 1.4 1.3 2.3h4c0-.9.6-1.8 1.3-2.3A5.5 5.5 0 0 0 12 4.8z" />
        <path d="M10.2 19h3.6" />
      </svg>
    ),
  },
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
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
