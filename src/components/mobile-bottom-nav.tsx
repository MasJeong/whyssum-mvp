"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    href: "/roles",
    label: "직무",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="8" r="2.5" />
        <path d="M4.5 17c.7-2.1 2.4-3.2 4.5-3.2s3.8 1.1 4.5 3.2" />
        <circle cx="16.8" cy="9" r="1.8" />
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
    label: "추천",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 4.5l1.9 3.8 4.2.6-3 2.9.7 4.2L12 14l-3.8 2 .7-4.2-3-2.9 4.2-.6L12 4.5z" />
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
    label: "관심",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 5.5h10v13l-5-2.7-5 2.7v-13z" />
      </svg>
    ),
  },
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
            <span className="tab-icon" aria-hidden="true">{tab.icon}</span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
