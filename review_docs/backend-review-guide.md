# 왜씀? 전체 구현 검토 가이드 (백엔드 개발자용)

프론트 프레임워크 지식이 없어도 전체 구조와 동작을 검토할 수 있게 정리한 문서입니다.

## 1) 먼저 보는 순서 (권장)

1. `src/app/api/recommendations/route.ts`
2. `src/app/api/trends/[role]/route.ts`
3. `src/app/api/briefings/route.ts`
4. `src/app/api/subscribe/route.ts`
5. `src/app/feed.xml/route.ts`
6. `src/app/api/growth-events/route.ts`
7. `src/app/api/growth-kpis/route.ts`
8. `src/app/api/snapshots/route.ts`
9. `src/app/sitemap.ts`
10. `src/lib/live-role-trends.ts`
11. `src/lib/briefing-data.ts`
12. `src/lib/security/rate-limit.ts`
13. `src/lib/security/validation.ts`
14. `src/lib/mvp-data.ts`
15. `src/lib/trend-schedule-store.ts`

위 6개만 보면, 데이터 요청/검증/가공/응답까지 핵심 로직을 거의 다 파악할 수 있습니다.

---

## 2) 지금 구현된 기능 한눈에

- 직무별 트렌드 조회 (`/trends/[role]`)
- 상황추천 조건 입력 후 재계산 (`/scenarios/[role]` + `/api/recommendations`)
- 비교 화면에서 직무 전환 + 다중 선택 비교 (`/compare` + `/api/trends/[role]`)
- 관심리스트 저장/조회 (`/watchlist`, localStorage)
- 브리핑 조회/필터 (`/briefings` + `/api/briefings`)
- 기본 보안 적용
  - 보안 헤더 (`middleware.ts`)
  - 입력 검증 (`zod`)
  - rate limit (메모리 기반)

---

## 3) API 설계/응답 구조

### A. 추천 API

- 경로: `GET /api/recommendations`
- 파일: `src/app/api/recommendations/route.ts`
- 입력 쿼리:
  - `role`: `backend | designer | pm` (필수)
  - `teamSize`, `timeline`, `priority` (선택)
- 검증:
  - `src/lib/security/validation.ts`의 `recommendationQuerySchema`
- 응답:
  - 추천안 목록(안정형/속도형/확장형)
  - 추천안별 상세 근거(`reasons`)
  - 추천안별 신뢰도(`confidenceScore`, `trustLevel`)
  - 추천안별 Why now 설명(`whyNow`)
  - 추천안별 의사결정 축(`tradeoff.speed/stability/scalability`)
  - 필터 정보 echo
  - 관련 시나리오 목록
  - source note
- 실패 케이스:
  - 400: 파라미터 검증 실패
  - 429: rate limit 초과
  - 500: 내부 처리 오류

### B. 트렌드 API

- 경로: `GET /api/trends/[role]`
- 파일: `src/app/api/trends/[role]/route.ts`
- 동작:
  - `getRoleTrendMetrics(role)` 호출
  - live 성공 시 `mode: live`
  - 실패 시 `mode: fallback` + 샘플 데이터

### C. 브리핑 API

- 경로: `GET /api/briefings`
- 파일: `src/app/api/briefings/route.ts`
- 입력 쿼리:
  - `role`: `all | backend | designer | pm`
  - `impact`: `all | high | medium | low`
  - `periodDays`: 1~180
- 응답:
  - 브리핑 카드 배열
  - 적용 필터
  - count, fetchedAt
  - summary(`highImpactCount`, `recentCount7d`, `recommendedRole`)
  - filters.sortBy (`priority` | `publishedAt`)

### C-1. 트렌드 스케줄 API

- 경로:
  - `GET /api/trends/schedule`
  - `POST /api/trends/schedule`
- 파일:
  - `src/app/api/trends/schedule/route.ts`
  - `src/lib/trend-schedule-store.ts`
- 동작:
  - 최근 실행 상태(lastRunAt/lastDurationMs/lastSuccess/lastResults) 조회
  - 최근 실행 이력(`history`)과 저장 모드(`persistenceMode`) 반환
  - 실패 또는 fallback 실행 시 `TRENDS_ALERT_WEBHOOK_URL` 웹훅 알림 시도

### D. 구독 API

- 경로: `POST /api/subscribe`
- 파일: `src/app/api/subscribe/route.ts`
- 입력 바디:
  - `email` (유효한 이메일 형식)
- 검증:
  - `src/lib/security/validation.ts`의 `subscribeBodySchema`
- 동작:
  - 중복 이메일이면 성공 메시지로 응답(멱등 처리)
  - 신규 이메일이면 메모리 Set에 저장
- 실패 케이스:
  - 400: 이메일 형식 오류
  - 429: rate limit 초과
  - 500: 내부 처리 오류

### E. 브리핑 RSS

- 경로: `GET /feed.xml`
- 파일: `src/app/feed.xml/route.ts`
- 동작:
  - 브리핑 데이터를 최신순 25건으로 정렬해 RSS XML 생성
  - `Cache-Control`로 공개 캐시 정책 적용

### F. 성장 이벤트 수집 API

- 경로: `POST /api/growth-events`
- 파일: `src/app/api/growth-events/route.ts`
- 입력 바디:
  - 성장 이벤트 이름, 페이지 키, visitor/session 식별자, occurredAt, meta
- 동작:
  - Zod 기반 이벤트 검증 후 메모리 저장소에 적재
  - rate limit 헤더 포함

### G. 성장 KPI API

- 경로: `GET /api/growth-kpis?window=d1|d7|d30`
- 파일: `src/app/api/growth-kpis/route.ts`
- 동작:
  - 최근 이벤트 저장소에서 activation/share/revisit/ad CTR/newsletter 비율 집계

### H. 공유 스냅샷 API

- 경로:
  - `POST /api/snapshots`
  - `GET /api/snapshots/[snapshotId]`
- 파일:
  - `src/app/api/snapshots/route.ts`
  - `src/app/api/snapshots/[snapshotId]/route.ts`
- 동작:
  - 상황추천/비교 상태를 TTL 포함 메모리 스냅샷으로 저장
  - snapshot ID로 재조회해 공유 진입 시 상태 복원

---

## 4) 실데이터 파이프라인 (핵심)

- 파일: `src/lib/live-role-trends.ts`

### 데이터 소스

- GitHub 공개 API 2종
  1. `/repos/{owner}/{repo}` -> `stargazers_count`
  2. `/repos/{owner}/{repo}/commits?since=...` -> 최근 30일 커밋 수
- npm 다운로드 API (가능한 도구)
- PyPI 통계 API (가능한 도구)
- catalog signal(보조 신호)

### 계산 방식

- popularity score = star weight + activity weight
- role 내 score 정규화 -> `adoptionRate`
- commit 수 기반 -> `growthRate`
- adoption + growth + stars 조합 -> `demandIndex`
- 추가 지표: `activityScore`, `communityScore`, `stabilityScore`
- 추가 지표: `confidenceScore`, `trustLevel`, `trendSeries`

### 안정성

- 메모리 캐시 TTL 12시간
- 일부 repo 실패 시 해당 항목만 fallback snapshot 적용
- npm/PyPI 개별 실패 시 해당 소스만 제외하고 계산
- 전체 호출 실패 시 `mvp-data.ts` fallback
- 결과에 `mode`, `source`, `fetchedAt` 포함

---

## 5) 보안/운영 포인트

### 적용된 것

- `middleware.ts`
  - CSP, Referrer-Policy, X-Frame-Options, nosniff, COOP, HSTS(https)
- `rate-limit.ts`
  - IP 기반 요청 제한(메모리)
- `validation.ts`
  - zod 기반 입력 검증

### 아직 남은 운영 과제

- rate limit을 Redis 기반 분산형으로 전환
- GitHub API 인증 토큰(서버 env) 적용으로 rate limit 여유 확보
- 요청 로깅/관측(Sentry/PostHog) 강화

---

## 6) 화면-서버 연결 관계 (React 몰라도 보는 방법)

- 트렌드 화면 서버 렌더:
  - `src/app/trends/[role]/page.tsx`
  - 내부에서 바로 `getRoleTrendMetrics` 호출
- 비교/상황추천 화면 클라이언트 요청:
  - `src/components/compare-interactive.tsx` -> `/api/trends/[role]`
  - `src/components/scenario-explorer.tsx` -> `/api/recommendations`

즉, 백엔드 관점에서는 **API 2개 + 데이터 가공 모듈 1개**가 본체입니다.

---

## 7) 검토 체크리스트 (백엔드용)

- [ ] API 에러코드/메시지 정책이 일관적인가?
- [ ] 검증 스키마가 요구사항을 충분히 제한하는가?
- [ ] 외부 API 실패 시 fallback이 끊김 없이 동작하는가?
- [ ] 계산식(adoption/growth/demand)이 도메인적으로 납득 가능한가?
- [ ] rate limit이 운영 트래픽을 감당할 구조인가?

---

## 8) 바로 실행해서 검증하기

```bash
npm run dev
```

검증 URL:

- `http://localhost:3000/trends/backend`
- `http://localhost:3000/compare`
- `http://localhost:3000/scenarios/backend`
- `http://localhost:3000/api/trends/backend`
- `http://localhost:3000/api/recommendations?role=backend&teamSize=1~3명&timeline=2개월&priority=빠른 출시`
