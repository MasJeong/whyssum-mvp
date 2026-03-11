# 왜씀? 서비스 개요

## 한 줄 소개

왜씀은 직무별(백엔드/디자이너/PM) 도구 선택을 **트렌드 + 상황추천 + 비교**로 빠르게 연결해, 팀 의사결정 근거를 짧은 시간 안에 정리할 수 있게 돕는 무료 플랫폼입니다.

## 어떤 문제를 해결하나

- "요즘 많이 쓴다"는 정보만으로는 우리 팀에 맞는 선택을 설명하기 어려운 문제
- 팀 규모/일정/우선순위가 다를 때 추천 결과가 달라져야 하는 문제
- 최종 선택안을 공유 가능한 형태로 빠르게 정리해야 하는 협업 문제

## 핵심 사용자

- 백엔드 리드/개발자: 성능, 운영 안정성, 확장성 중심으로 후보를 고르는 사용자
- 디자이너/디자인 리드: 협업 생산성과 디자인 품질/속도 균형이 중요한 사용자
- PM/PO: 출시 속도, 팀 커뮤니케이션, 리스크 관리 관점에서 판단하는 사용자

## 핵심 사용 흐름

1. 직무 선택 (`/roles`)
2. 직무별 트렌드 확인 (`/trends/[role]`)
3. 팀 조건 기반 상황추천 재계산 (`/scenarios/[role]`)
4. 후보 압축 비교 (`/compare`)
5. 브리핑/인사이트로 후속 판단 (`/briefings`, `/insights`)

## 주요 기능

- 직무별 트렌드 표/정렬/Top N 탐색
- 상황추천(팀 규모/일정/우선순위) + 추천 근거/트레이드오프 표시
- 비교 화면에서 후보 선택/점검 + 공유 요약
- 공유 스냅샷 URL 복원 (`snapshot`)
- 관련 콘텐츠 추천 섹션으로 다음 행동 유도
- 재방문 배지(브리핑 및 핵심 페이지)로 리텐션 가시화
- 관심리스트 저장/관리 + 다음 행동 CTA
- 성장 KPI 대시보드(`/growth`)와 이벤트 기반 D1/D7/D30 집계

## 수익/운영 모델

- 기본 사용은 무료
- 광고 슬롯 기반 1차 수익화
- 광고 실험(A/B)과 CTR, 활성화율, 재방문율을 함께 보며 UX 손상 없이 최적화

## 기술 및 구조 요약

- 프론트엔드
  - Next.js 16 (App Router)
  - React 19
  - TypeScript (strict 모드)
  - Tailwind CSS 4

- 백엔드/API
  - Next.js Route Handler 기반 API (`src/app/api/**/route.ts`)
  - 입력 검증: Zod
  - 응답 형식: JSON + 상태코드/안전 에러 응답

- 데이터/분석
  - 성장 이벤트 수집: `POST /api/growth-events`
  - KPI 집계: `GET /api/growth-kpis` (D1/D7/D30)
  - 공유 스냅샷 저장/복원: `POST /api/snapshots`, `GET /api/snapshots/[snapshotId]`
  - 현재 저장소: 메모리 + 브라우저 localStorage (일부 기능)

- 보안/운영 기본
  - 보안 헤더 미들웨어(CSP/HSTS/X-Frame-Options 등)
  - 인메모리 rate limit (`X-RateLimit-*` 헤더)
  - robots/sitemap/feed/manifest 라우트 운영

- 품질/개발 도구
  - ESLint 9 (flat config)
  - 빌드/타입 검증: `npm run build`
  - 패키지 매니저: npm

- 주요 API
  - `GET /api/recommendations`
  - `GET /api/trends/[role]`
  - `GET /api/briefings`
  - `POST /api/subscribe`
  - `POST /api/growth-events`
  - `GET /api/growth-kpis`
  - `POST /api/snapshots`
  - `GET /api/snapshots/[snapshotId]`

## 현재 상태와 제약

- 핵심 기능은 동작하며 lint/build 기준 통과 상태
- 성장 이벤트/KPI 저장소는 현재 메모리 기반이라 서버 재시작 시 누적 데이터가 초기화될 수 있음
- 운영 고도화를 위해 영속 저장소 연결과 evidence 기반 QA 자동화가 다음 단계

## 다음 우선순위

1. KPI 저장소 영속화(운영 신뢰도 강화)
2. `.sisyphus/evidence/` 기반 QA 증거 수집 루틴 정착
3. 성장 실험 주간 리뷰(runbook) 반복 운영
