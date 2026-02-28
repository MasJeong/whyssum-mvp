# React/Next 온보딩 가이드 (왜씀 프로젝트)

이 문서는 React가 익숙하지 않은 개발자가 이 프로젝트를 빠르게 이해하도록 돕는 실전 온보딩 문서입니다.

## 1) 먼저 큰 그림부터

- 이 프로젝트는 "왜 이 도구를 쓰는지"를 직무별로 설명하는 Next.js 앱입니다.
- 페이지 경로는 `src/app/`, UI 조각은 `src/components/`, 데이터/비즈니스 로직은 `src/lib/`에 모여 있습니다.
- 기본 원칙은 "서버에서 먼저 그리고, 브라우저에서는 필요한 인터랙션만 처리"입니다.

## 2) 폴더 구조를 이렇게 이해하세요

- `src/app/layout.tsx`
  - 모든 페이지 공통 껍데기(헤더/푸터/모바일 네비)
- `src/app/page.tsx`
  - 홈 페이지
- `src/app/scenarios/[role]/page.tsx`
  - 역할별 상황추천 페이지 (동적 라우트)
- `src/app/api/recommendations/route.ts`
  - 추천 계산 API
- `src/components/scenario-explorer.tsx`
  - 필터 선택, API 호출, 카드 상세 토글 등 사용자 인터랙션
- `src/lib/mvp-data.ts`
  - 역할/트렌드/추천 샘플 데이터 + 타입 정의
- `src/lib/security/validation.ts`
  - API 입력 검증(Zod)
- `src/lib/security/rate-limit.ts`
  - 요청 제한

## 3) React 초보자가 꼭 알아야 할 핵심

- 컴포넌트는 "재사용 가능한 UI 함수"입니다.
- `useState`는 컴포넌트의 메모리입니다.
  - 값이 바뀌면 해당 컴포넌트가 다시 렌더링됩니다.
- `useEffect`는 렌더링 후 실행되는 동기화 작업입니다.
  - 예: API 호출, localStorage 저장/복원
- `useMemo`는 계산 결과 캐시입니다.
  - 동일 입력에서 불필요한 재계산을 줄입니다.

## 4) Next App Router에서 가장 중요한 개념

- `src/app`의 페이지는 기본적으로 Server Component입니다.
- 파일 상단에 `"use client"`가 있으면 Client Component입니다.
- Client Component에서만 아래 기능을 직접 씁니다.
  - 브라우저 API(`window`, `localStorage`)
  - 이벤트 핸들러(`onClick`)
  - 상태 훅(`useState`, `useEffect`)

쉽게 말하면:
- 서버 컴포넌트: "초기 화면을 준비하는 주방"
- 클라이언트 컴포넌트: "사용자 클릭에 즉시 반응하는 홀"

## 5) 이 프로젝트의 핵심 흐름: 상황추천

### 5-1. 페이지 진입

1. 사용자가 `/scenarios/backend` 접근
2. `src/app/scenarios/[role]/page.tsx`가 역할 정보와 시나리오를 읽어 기본 화면을 렌더링
3. 같은 페이지 안에서 `ScenarioExplorer`(클라이언트)를 렌더링

### 5-2. 클라이언트 상태 초기화

`src/components/scenario-explorer.tsx`에서:
- 필터 상태(`teamSize`, `timeline`, `priority`) 생성
- 저장된 마지막 선택(localStorage) 복원
- 필터 변경 시 디바운스(200ms) 후 추천 API 재호출

### 5-3. API 요청

클라이언트는 다음 형태로 호출:

`GET /api/recommendations?role=backend&teamSize=1~3명&timeline=2개월&priority=빠른 출시`

### 5-4. 서버 처리

`src/app/api/recommendations/route.ts`에서:

1. rate limit 검사
2. Zod로 쿼리 검증
3. 조건(팀규모/일정/우선순위)에 따라 추천 점수 가중치 계산
4. 신뢰도/Why now/트레이드오프 수치 계산
5. 응답 반환

### 5-5. UI 반영

클라이언트가 응답을 받아 카드 UI를 업데이트:
- 기본 요약: 적합도, 신뢰도, 판단
- 상세 보기: 상황 해설, 실행 체크리스트, 추천 근거, 장점/리스크

## 6) 파일을 읽는 순서 (실전)

아래 순서대로 읽으면 흐름이 빨리 잡힙니다.

1. `src/app/scenarios/[role]/page.tsx`
2. `src/components/scenario-explorer.tsx`
3. `src/app/api/recommendations/route.ts`
4. `src/lib/security/validation.ts`
5. `src/lib/mvp-data.ts`

## 7) 줄 단위로 읽는 팁 (React 초보자용)

`scenario-explorer.tsx`를 읽을 때는 이 순서를 지키세요.

1. **타입 정의부터** 읽기
   - `ApiResponse`, `RecommendationInsight`, `ScenarioSnapshot`
2. **상태 선언부** 읽기
   - `useState`에 어떤 상태가 있는지 메모
3. **useEffect 블록** 읽기
   - 언제 API를 호출하고, 언제 localStorage를 저장/복원하는지 확인
4. **핸들러 함수** 읽기
   - `searchRecommendations`, `saveCurrentSnapshot`, `toggleCardDetail`
5. **JSX 리턴부** 읽기
   - 상단(요약)과 하단(상세)이 어떻게 분리되어 있는지 확인

중요: JSX가 길어 보이면 "무엇을 보여주는지"보다 "어떤 상태를 쓰는지"부터 보세요.

## 8) 자주 하는 실수

- `useEffect` 의존성 누락으로 호출 타이밍 꼬임
- 클라이언트 컴포넌트가 아닌데 `window` 사용
- API 에러 처리 없이 성공 케이스만 가정
- 상태를 너무 많이 한 컴포넌트에 몰아넣어 읽기 어려워짐

## 9) 기능 확장 포인트

- 추천 규칙 추가:
  - `src/app/api/recommendations/route.ts`의 점수 계산 분기 확장
- 필터 추가:
  - `src/lib/security/validation.ts` 스키마 + `scenario-explorer.tsx` UI/상태 확장
- 데이터 소스 변경:
  - `src/lib/mvp-data.ts`를 실제 수집 파이프라인 연동으로 교체

## 10) 로컬 검증 루틴

변경 후 반드시 실행:

```bash
npm run lint
npm run build
```

이 두 명령이 통과하면 타입/빌드 기준으로는 안전한 상태입니다.
