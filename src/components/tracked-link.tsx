"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import type { GrowthEventName } from "@/lib/growth-events";
import { trackGrowthEvent } from "@/lib/growth-events";

type TrackedLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  eventName: GrowthEventName;
  eventPage: string;
  eventMeta?: Record<string, string | number | boolean | null | undefined>;
  children: ReactNode;
};

/**
 * 클릭 시 성장 이벤트를 기록하는 링크 컴포넌트다.
 * @param href 이동 경로
 * @param eventName 이벤트 이름
 * @param eventPage 이벤트 페이지 키
 * @param eventMeta 부가 메타데이터
 * @param children 링크 콘텐츠
 * @returns 추적 가능한 링크 UI
 */
export default function TrackedLink({ href, eventName, eventPage, eventMeta, children, onClick, ...props }: TrackedLinkProps) {
  return (
    <Link
      {...props}
      href={href}
      onClick={(event) => {
        void trackGrowthEvent({ name: eventName, page: eventPage, meta: { href, ...eventMeta } });
        onClick?.(event);
      }}
    >
      {children}
    </Link>
  );
}
