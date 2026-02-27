# 왜씀? 전체 구현 검토 가이드 (백엔드 개발자용)

프론트 프레임워크 지식이 없어도 전체 구조와 동작을 검토할 수 있게 정리한 문서입니다.

## 1) 먼저 보는 순서 (권장)

1. `src/app/api/recommendations/route.ts`
2. `src/app/api/trends/[role]/route.ts`
3. `src/app/api/briefings/route.ts`
4. `src/lib/live-role-trends.ts`
5. `src/lib/briefing-data.ts`
6. `src/lib/security/rate-limit.ts`
7. `src/lib/security/validation.ts`
8. `src/lib/mvp-data.ts`

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
