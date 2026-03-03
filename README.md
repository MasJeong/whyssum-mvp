# 왜씀? (whyssum)

직무별 도구 선택에서 "왜 이 선택을 했는지"를 설명할 수 있게 만든 MVP입니다.

## 왜 만들었는가

- 트렌드 데이터만 보면 선택 이유를 설명하기 어려웠습니다.
- 실제 선택 상황(팀 규모/일정/우선순위)을 반영한 추천이 필요했습니다.
- 추천 결과를 점수만이 아니라 근거와 트레이드오프로 보여주고 싶었습니다.

## 현재 구현 범위

- 직무 허브, 트렌드, 상황추천, 비교, 브리핑, 관심리스트, 인사이트 페이지
- 4개 API 라우트
  - `GET /api/recommendations`
  - `GET /api/trends/[role]`
  - `GET/POST /api/trends/schedule`
  - `GET /api/briefings`
- 트렌드 페이지 쿼리
  - `topN`: 5/8/12 표시 개수 선택
  - `sortBy`: `adoption | demand | growth | confidence` 정렬 기준 선택
- 비교 페이지 모드
  - 기본 모드: 최대 4개 선택
  - 고급 모드: 최대 8개 선택
- 추천 결과에 `reasons`, `confidenceScore`, `trustLevel`, `whyNow`, `tradeoff`, `appliedRules` 포함

## 구현에서 신경 쓴 점

### 1) 설명 가능한 추천

- 상황추천은 필터(팀 규모/일정/우선순위) 기반으로 점수를 재계산합니다.
- 결과에 "왜 지금 이 선택인지"와 트레이드오프(속도/안정성/확장성)를 함께 제공합니다.
- 근거(`reasons`)와 적용 규칙(`appliedRules`)을 응답에 포함해 결과를 추적할 수 있게 했습니다.

관련 코드:
- `src/app/api/recommendations/route.ts`
- `src/components/scenario-explorer.tsx`

### 2) 외부 데이터 실패 대응

- 트렌드 데이터는 GitHub 메타데이터를 기본으로 보고, npm/PyPI 신호를 보조로 사용합니다.
- 외부 호출 실패 시 fallback 데이터를 반환하고, 응답에 `mode: live | fallback`를 포함합니다.
- 트렌드 API는 `sortBy` 쿼리를 지원하며 잘못된 값은 `adoption`으로 안전 fallback합니다.

관련 코드:
- `src/lib/live-role-trends.ts`
- `src/app/api/trends/[role]/route.ts`

### 3) 브리핑 재방문 허브

- 브리핑 화면은 필터 상태(`role`, `impact`, `periodDays`)를 로컬에 저장해 재방문 시 자동 복원합니다.
- 상단 요약에서 High 영향도 건수/최근 7일 건수/추천 직무를 함께 보여줍니다.
- 카드는 영향도 우선 정렬로 노출되며, 다음 행동(상황추천/트렌드/비교/원문) 순서로 의사결정 동선을 제공합니다.

관련 코드:
- `src/app/api/briefings/route.ts`
- `src/components/briefing-board.tsx`

### 4) 기본 보안/안정성

- 입력 검증: Zod 스키마 검증
- 요청 제한: IP 기준 인메모리 rate limit
- 응답 헤더: `X-RateLimit-*` 헤더 통일
- 미들웨어: CSP/HSTS/X-Frame-Options 등 기본 보안 헤더 적용
- 에러 응답: 스택 트레이스 비노출
- 트렌드 스케줄 갱신 API는 `TRENDS_CRON_SECRET` 설정 시 비밀키 검증 후 실행

관련 코드:
- `src/lib/security/validation.ts`
- `src/lib/security/rate-limit.ts`
- `src/app/api/recommendations/route.ts`
- `src/app/api/briefings/route.ts`
- `middleware.ts`

## 기술 스택

- Next.js 16 (App Router)
- React 19
- TypeScript (strict)
- Tailwind CSS 4
- Zod
- ESLint 9

## 실행 방법

Node.js 20+ 기준

```bash
npm install
npm run dev
```

브라우저: `http://localhost:3000`

## 검증 명령

```bash
npm run lint
npm run build
```

## 한계 (현재 상태)

- rate limiting은 인메모리 기반이라 다중 인스턴스 환경에서 공유되지 않습니다.
- 인증/권한은 아직 넣지 않았습니다 (MVP 범위).
- 실데이터 수집 파이프라인은 단순화된 형태이며, 운영 단계에서 고도화가 필요합니다.

보안 관련 상세: `SECURITY.md`
