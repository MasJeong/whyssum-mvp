# 왜씀? (whyssum)

"요즘 왜 이걸 쓰는지"를 직무 관점으로 빠르게 판단하도록 만든 의사결정 지원 MVP입니다.

면접관이 이 프로젝트를 빠르게 평가할 때 핵심은 `기능 수`보다, `의사결정 모델`, `신뢰성 장치`, `실제 운영 가정`입니다.

## 1분 평가 포인트 (면접관용)

- 문제 정의가 명확함: 트렌드 확인 -> 상황추천 -> 비교 -> 최종 선택 흐름을 한 제품 안에서 완결
- API 품질 기준이 보임: 입력 검증(Zod), 명시적 400/429/500 처리, rate-limit 헤더 일관 제공
- 신뢰성 대비가 있음: 외부 데이터 실패 시 단계적 fallback, 데이터 모드(live/fallback) 노출
- 상태 설계가 현실적임: 관심리스트/추천조건 스냅샷을 로컬 저장소에 안전하게 유지
- 확장 방향이 선명함: 인메모리 rate limit 한계와 운영 하드닝 항목을 `SECURITY.md`에 분리 관리

## 프로젝트 개요

- 목적: 직무별(백엔드/디자이너/PM) 도구 선택 근거를 짧은 시간 안에 제시
- 핵심 가치: "선택 이유"를 점수/근거/트레이드오프로 설명 가능한 형태로 제공
- 대상 시나리오: 신규 도입 검토, 팀 내 합의, 빠른 PoC 의사결정

## 주요 기능

- 직무 허브: 역할별 진입점 제공 (`/roles`)
- 트렌드 분석: 도구별 채택/성장/수요 + 활동/커뮤니티/안정성/신뢰도 지표 (`/trends/[role]`)
- 상황추천: 팀 규모/일정/우선순위 기반 동적 재계산 + Why now + 신뢰도 + 트레이드오프 (`/scenarios/[role]`)
- 비교: 직무 전환 + 최대 4개 후보 다중 선택 비교 (`/compare`)
- 브리핑: 직무/영향도/기간 필터형 이슈 카드 (`/briefings`)
- 관심리스트: 로컬 저장 기반 북마크 (`/watchlist`)
- 인사이트: 월간 요약 카드 (`/insights`)

## 아키텍처 한눈에 보기

### Frontend

- Next.js App Router + React 19
- 기본은 Server Component, 상호작용이 필요한 영역만 Client Component
- 모바일 하단 탭 + 스티키 CTA 포함 반응형 레이아웃

### Backend (Route Handler)

- `src/app/api/recommendations/route.ts`
  - 조건 기반 추천 점수 계산
  - Zod 입력 검증
  - 분당 30회 IP rate limit
- `src/app/api/briefings/route.ts`
  - 브리핑 필터링(role/impact/periodDays)
  - 기간 값 clamp(1~180)
  - 분당 40회 IP rate limit
- `src/app/api/trends/[role]/route.ts`
  - 직무별 트렌드 지표 반환
  - role 화이트리스트 검증

### Data Layer

- 기본 샘플 데이터: `src/lib/mvp-data.ts`
- 라이브 트렌드 수집: `src/lib/live-role-trends.ts`
  - GitHub 메타데이터(stars/commits/contributors)
  - npm/PyPI 보조 신호
  - 캐시 TTL(12h) + 실패 시 fallback snapshot

## 의사결정 모델 (핵심 로직)

- 추천 점수는 직무 기본 점수 + 조건 가중치(팀규모/일정/우선순위)로 보정
- 신뢰도(`confidenceScore`)는 적합도, 트렌드 신호, 근거 개수를 결합해 산출
- 트레이드오프는 속도/안정성/확장성 3축으로 분해해 시각화
- 결과에는 `whyNow`, `reasons`, `appliedRules`를 포함해 설명 가능성 확보

## 신뢰성/보안 설계

- 입력 검증: `zod` 기반 서버 검증 (`src/lib/security/validation.ts`)
- 요청 제한: 인메모리 버킷 기반 IP rate limit (`src/lib/security/rate-limit.ts`)
- 보안 헤더: CSP, HSTS(HTTPS), X-Frame-Options 등 (`middleware.ts`)
- 인덱싱 제어: `/api/*`, `/watchlist` noindex 정책 (`src/app/robots.ts`, middleware)
- 에러 정책: 내부 스택 노출 없이 안전한 JSON 오류 메시지 반환

자세한 보안 참고: `SECURITY.md`

## 화면/라우트 맵

- `/` 홈
- `/roles` 직무 허브
- `/trends/[role]` 직무별 트렌드
- `/briefings` 트렌드 브리핑
- `/scenarios/[role]` 직무별 상황추천
- `/compare` 비교
- `/watchlist` 관심리스트
- `/insights` 월간 인사이트

## API 계약 예시

### 1) 추천

- `GET /api/recommendations?role=backend&teamSize=1~3명&timeline=2개월&priority=빠른 출시`
- 반환 핵심 필드: `recommendations[]`, `reasons`, `confidenceScore`, `trustLevel`, `whyNow`, `tradeoff`, `appliedRules`

### 2) 트렌드

- `GET /api/trends/backend`
- 반환 핵심 필드: `metrics[]`, `mode(live|fallback)`, `source`, `fetchedAt`

### 3) 브리핑

- `GET /api/briefings?role=backend&impact=high&periodDays=30`
- 반환 핵심 필드: `filters`, `count`, `fetchedAt`, `items[]`

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript (strict)
- Tailwind CSS 4
- Zod
- ESLint 9 (flat config)

## 시작하기

Node.js 20+ 환경이 필요합니다.

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 스크립트

- `npm run dev` - 개발 서버
- `npm run build` - 프로덕션 빌드
- `npm run start` - 프로덕션 서버
- `npm run lint` - 린트

## 검증 기준

이 저장소는 아래 두 항목을 통과해야 완료로 간주합니다.

```bash
npm run lint
npm run build
```

## 현재 한계와 다음 단계

- 현재 rate limiting은 인메모리 기반으로 인스턴스 간 공유되지 않음
- 인증/권한, 분산 limiter(예: Redis), 관측성(Sentry/PostHog)은 후속 하드닝 대상
- 라이브 데이터 소스는 일부 퍼블릭 메타데이터 기반이며, 운영 단계에서 수집 파이프라인 고도화 예정
