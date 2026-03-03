# 트렌드 정렬 고도화 구현 계획서

## 목적

직무별 트렌드 목록의 기본 정렬 기준과 사용자 선택 정렬을 명확하게 제공해,
사용자가 상황에 맞는 지표(채택률/수요/성장/신뢰도)로 빠르게 판단할 수 있도록 한다.

## 목표

1. 트렌드 목록 기본 정렬을 `채택률 내림차순`으로 통일한다.
2. 사용자가 정렬 기준을 직접 선택할 수 있게 한다.
3. 선택한 정렬 기준은 URL 쿼리로 유지되어 공유/재방문 시 동일 상태를 재현한다.

## 범위

### 포함

- `GET /api/trends/[role]`에 `sortBy` 쿼리 지원
- 트렌드 페이지(`/trends/[role]`)에 정렬 셀렉트 추가
- `topN`과 `sortBy` 동시 반영
- 문서(`README.md`, `review_docs/changed-files.md`, `review_docs/cautions.md`) 최신화

### 제외

- 다중 정렬(예: 채택률 우선, 동률 시 성장률)
- 사용자별 정렬 선호도 영구 저장(localStorage)
- 비교/브리핑 화면의 정렬 정책 변경

## 정렬 정책

- 허용 정렬 키
  - `adoption`: 채택률 내림차순
  - `demand`: 수요지수 내림차순
  - `growth`: 성장률 내림차순
  - `confidence`: 신뢰도 점수 내림차순
- 잘못된 `sortBy` 입력은 `adoption`으로 fallback
- 동률일 때는 기술명(`tool`) 오름차순으로 안정 정렬

## 구현 설계

1. API 확장 (`src/app/api/trends/[role]/route.ts`)
   - `request.url`에서 `sortBy` 파싱
   - 허용값 검증 후 기본값 적용
   - `getRoleTrendMetrics` 결과의 `metrics`를 정렬하여 응답
   - 응답에 `sortBy`를 포함해 UI/클라이언트가 현재 정렬 기준을 확인 가능하게 함

2. 페이지 확장 (`src/app/trends/[role]/page.tsx`)
   - `searchParams`에 `sortBy` 추가
   - 서버 컴포넌트에서 `sortBy` 검증 및 기본값 적용
   - 기존 `topN` 링크에 현재 `sortBy`를 유지
   - 정렬 기준 선택 UI(링크형 pill) 추가

## 수용 기준

- `/trends/backend?sortBy=adoption`에서 채택률 내림차순 노출
- `/trends/backend?sortBy=demand`에서 수요지수 내림차순 노출
- `/trends/backend?sortBy=growth`에서 성장률 내림차순 노출
- `/trends/backend?sortBy=confidence`에서 신뢰도 내림차순 노출
- 잘못된 `sortBy`는 `adoption`으로 안전 처리
- `topN` 변경 시 정렬 기준이 유지되고, 정렬 변경 시 `topN`이 유지됨
- `npm run lint`, `npm run build` 통과

## 리스크 및 대응

- 정렬 기준 증가로 URL 조합이 복잡해질 수 있음
  - 대응: 허용 쿼리값을 고정하고 잘못된 값은 기본값으로 처리
- 트렌드 데이터에 일부 필드 누락 가능성
  - 대응: `confidenceScore` 누락 시 안전 fallback(0) 적용
