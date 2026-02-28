# 트렌드 브리핑 기능 구현 계획서

## 목적

트렌드 수치(채택률/성장률/신뢰도)만으로는 "왜 변화했는지"를 설명하기 어렵다.
`트렌드 브리핑` 메뉴를 추가해 수치 + 해석(뉴스/동향)을 함께 제공한다.

## 목표

1. 직무별로 최신 동향을 빠르게 탐색할 수 있어야 함
2. 브리핑에서 트렌드/비교/상황추천으로 이어지는 의사결정 동선을 제공
3. 수동 큐레이션 데이터로 시작하고, 이후 자동 수집으로 확장 가능해야 함

## 범위

### 포함

- `/briefings` 페이지 추가
- 브리핑 데이터 모델(직무, 태그, 영향도, 출처, 발행일, 요약)
- 필터 기능(직무/기간/영향도)
- 출처 링크 제공 및 관련 기능 CTA
- 네비게이션(상단/하단/푸터) 연동

### 제외 (후속)

- RSS/API 자동 수집 스케줄러
- AI 자동 요약 파이프라인
- 브리핑 개인화 추천

## 정보 구조

- 카드 단위 정보:
  - title
  - summary (2~3줄)
  - role (`backend | designer | pm | all`)
  - tags (`string[]`)
  - impact (`low | medium | high`)
  - publishedAt (ISO)
  - sourceName
  - sourceUrl
  - relatedTool
  - action links (`/trends/[role]`, `/compare`, `/scenarios/[role]`)

## API/데이터 설계

- 파일: `src/lib/briefing-data.ts`
  - 초기 수동 큐레이션 seed 데이터
  - 필터 유틸 함수 제공
- API: `GET /api/briefings`
  - query: `role`, `periodDays`, `impact`
  - 응답: `items[]`, `count`, `fetchedAt`

## UI 설계

- 파일: `src/app/briefings/page.tsx`
- 섹션
  1. 헤더/설명
  2. 필터 바
  3. 브리핑 카드 리스트
  4. 빈 결과 안내
- 카드 액션
  - 원문 보기
  - 관련 트렌드
  - 비교로 이동
  - 상황추천으로 이동

## 수용 기준

- `/briefings` 진입 가능
- 직무/기간/영향도 필터가 정상 동작
- 카드에 출처/발행일/요약/태그/영향도가 보임
- 원문 링크가 새 탭으로 열림
- 네비게이션에서 브리핑 메뉴 접근 가능
- `npm run lint`, `npm run build` 통과
- 문서(`README.md`, `review_docs/*`) 최신화

## 리스크 및 대응

- 데이터 신선도 낮음: 카드에 발행일/출처 명시
- 큐레이션 편향: 직무별 균형 유지 규칙 적용
- 링크 품질 문제: 검증 가능한 공식 출처 우선
