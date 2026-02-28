# 변경 파일 요약

## 브랜딩/설정

- `package.json`: 패키지 이름을 `whyssum`으로 변경
- `package-lock.json`: 패키지 메타 동기화
- `README.md`: 프로젝트명/범위/라우트 설명 최신화

## 레이아웃/공통 UI

- `src/app/layout.tsx`
  - 상단 네비를 컴포넌트화하여 active 상태 반영
  - 모바일 전용 스티키 CTA/하단 탭 네비 연결
- `src/app/globals.css`
  - 전체 디자인 토큰/타이포/간격/반응형 재정의
  - 모바일 하단 네비, 스티키 CTA, 체크카드 스타일 추가

## 페이지 UX 개선

- `src/app/page.tsx`: 홈 히어로를 의사결정 플로우 중심으로 재구성
- `src/app/roles/page.tsx`: 직무 카드 정보 밀도 및 액션 흐름 강화
- `src/app/trends/[role]/page.tsx`: 직무 전환 pill, KPI 보조 설명, CTA 개선
- `src/app/scenarios/[role]/page.tsx`: 직무 전환 pill, 비교 유도 섹션 강화
- `src/app/compare/page.tsx`: 정적 비교표를 인터랙티브 비교 컴포넌트로 교체
- `src/app/insights/page.tsx`: 텍스트 위계/가독성 개선

## 신규 컴포넌트

- `src/components/nav-links.tsx`: 현재 경로 기반 active 네비
- `src/components/mobile-bottom-nav.tsx`: 모바일 하단 탭 네비
- `src/components/compare-interactive.tsx`: 체크박스 기반 비교 대상 선택(최소 1개, 최대 4개)

## 추가 반영 (웹사이트형 고도화)

- `src/app/layout.tsx`
  - 푸터 실서비스형 구성(링크/설명)으로 교체
  - 모바일 스티키 CTA를 경로 조건부 컴포넌트로 분리
- `src/app/page.tsx`
  - 랜딩 페이지 구조 강화(히어로, 빠른 진입, 신뢰 요소, FAQ)
- `src/components/mobile-sticky-cta.tsx`
  - `/scenarios/*` 경로에서 스티키 CTA 숨김 처리
- `src/components/scenario-explorer.tsx`
  - 상황 필터 기반 API 재계산 흐름 추가
- `src/components/compare-interactive.tsx`
  - 직무 전환 기반 동적 비교 데이터 생성
- `src/app/globals.css`
  - 모바일 깨짐 완화 및 랜딩/FAQ/푸터/폼 스타일 확장
- `review_docs/requirements.md`
  - 실제 웹사이트형 요건 정리 및 구현 매핑 문서 추가

## 추가 반영 (실데이터 연동 1차)

- `src/lib/live-role-trends.ts`
  - GitHub 공개 API(`repos`, `commits`) 기반 트렌드 지표 계산 로직 추가
  - 12시간 캐시 + 외부 실패 시 샘플 데이터 fallback
- `src/app/api/trends/[role]/route.ts`
  - role 기반 트렌드 API 엔드포인트 추가
- `src/app/trends/[role]/page.tsx`
  - 트렌드 페이지를 live/fallback 데이터 모드와 갱신 시점 표시로 확장
- `src/components/compare-interactive.tsx`
  - 비교 화면도 `/api/trends/[role]` 연동 데이터 사용으로 업그레이드

## 추가 반영 (고도화 2차)

- `src/lib/mvp-data.ts`
  - role별 트렌드 후보를 4개 -> 8개로 확장
  - 비교/트렌드 활용을 위한 확장 지표 필드 타입 추가
- `src/app/api/recommendations/route.ts`
  - 조건별 점수 가중치를 강화해 필터 변경 효과가 명확히 반영되도록 개선
- `src/components/scenario-explorer.tsx`
  - 조건 변경 시 자동 재계산 및 순위 표시 추가
- `src/lib/live-role-trends.ts`
  - stars/commits 외 contributors 지표까지 반영
  - 개별 repo 실패 시 부분 fallback으로 내결함성 강화
- `src/app/trends/[role]/page.tsx`
  - 활동/커뮤니티/안정성 KPI 및 컬럼 추가
- `src/components/compare-interactive.tsx`
  - 비교표에 활동성/커뮤니티/안정성 컬럼 추가

## 추가 반영 (고도화 3차)

- `review_docs/phase3-implementation-plan.md`
  - 신뢰도/추천근거/TopN/시계열/프리셋/관심리스트/멀티소스 계획 문서 추가
- `src/app/api/recommendations/route.ts`
  - 추천안별 상세 근거(`reasons`) 제공 및 조건별 가중치 로직 보강
- `src/components/scenario-explorer.tsx`
  - 맞춤 시나리오 프리셋 버튼, 자동 재계산, 추천 근거 상세 UI 추가
- `src/lib/live-role-trends.ts`
  - GitHub + npm + PyPI + catalog signal 결합(멀티소스)
  - 신뢰도 점수/등급, 6개월 시계열 추정치 생성
- `src/app/trends/[role]/page.tsx`
  - TOP N 토글, 신뢰도 배지, 소스 정보, 시계열 스파크라인 표시
- `src/components/watchlist-toggle.tsx`
  - 관심리스트 추가/해제 버튼 컴포넌트 추가(localStorage)
- `src/components/watchlist-view.tsx`
  - 관심리스트 조회/삭제/전체삭제 화면 로직 추가
- `src/app/watchlist/page.tsx`
  - 관심리스트 전용 페이지 추가
- `src/components/nav-links.tsx`, `src/components/mobile-bottom-nav.tsx`, `src/app/layout.tsx`
  - 관심리스트 내비게이션 경로 추가
- `src/app/globals.css`
  - 신뢰도 배지, 시계열 스파크라인, 관심 버튼 스타일 추가

## 추가 반영 (브리핑 메뉴)

- `review_docs/briefing-implementation-plan.md`
  - 브리핑 기능 구현 계획 문서 추가
- `src/lib/briefing-data.ts`
  - 브리핑 데이터 모델/시드/필터 함수 추가
- `src/app/api/briefings/route.ts`
  - 브리핑 조회 API 추가(직무/영향도/기간 필터 + rate limit)
- `src/components/briefing-board.tsx`
  - 브리핑 필터 및 카드 UI/동선 구현
- `src/app/briefings/page.tsx`
  - 브리핑 전용 페이지 추가
- `src/components/nav-links.tsx`, `src/components/mobile-bottom-nav.tsx`, `src/app/layout.tsx`
  - 상단/하단/푸터 네비게이션에 브리핑 메뉴 추가

## 추가 반영 (상황추천 explainability 고도화)

- `src/app/api/recommendations/route.ts`
  - 추천안별 신뢰도 점수/등급(`confidenceScore`, `trustLevel`) 계산 추가
  - 역할별 트렌드 신호를 반영한 `whyNow` 문장 생성 추가
  - 속도/안정성/확장성 트레이드오프 축(`tradeoff`) 계산 추가
- `src/components/scenario-explorer.tsx`
  - 카드에 신뢰도 배지, Why now 문장, 트레이드오프 프로그레스바 UI 추가
  - API 필드 누락 시 fallback 신뢰도/트레이드오프 표시 로직 추가
- `README.md`
  - 추천 API 응답 필드(근거/신뢰도/Why now/트레이드오프) 설명 추가
- `review_docs/requirements.md`, `review_docs/cautions.md`, `review_docs/backend-review-guide.md`
  - 상황추천 explainability 확장 사항 및 검토 포인트 반영

## 추가 반영 (상황추천 재방문 루프)

- `src/components/scenario-explorer.tsx`
  - 조건 스냅샷 저장/불러오기/삭제/전체삭제 UI 추가
  - 직무별 마지막 선택(teamSize/timeline/priority) 자동 복원 추가
  - 로컬 저장소 기반 스냅샷 최대 8개 제한 및 중복 저장 갱신 로직 추가
- `README.md`, `review_docs/requirements.md`, `review_docs/cautions.md`
  - 재방문 가치(저장/복원)와 QA 확인 포인트 문서 동기화

## 추가 반영 (상황추천 자세히 보기 고도화)

- `src/components/scenario-explorer.tsx`
  - 카드별 "자세히 보기/간단히 보기" 토글 추가
  - 상세 패널에 조건 정합성 해설/실행 체크리스트/반영 규칙 칩 UI 추가
  - 적합도/신뢰도 외 판단 카테고리/리스크 수준/주력 포인트 요약 추가
- `README.md`, `review_docs/requirements.md`, `review_docs/cautions.md`
  - 상세 해설 기능과 QA 포인트 문서 동기화

## 추가 반영 (상황맞춤 상세 UX 재정렬)

- `src/app/api/recommendations/route.ts`
  - 사용자 화면에 불필요한 MCP 추천 응답 계산/필드 제거
  - 상황추천 핵심 explainability 필드(`baseFitScore`, `scoreDelta`, `trendSignal`, `reasonCount`) 유지
- `src/components/scenario-explorer.tsx`
  - 상세 뷰에서 MCP 노출 제거
  - 기본 카드 정보 밀도 축소(핵심 요약 중심) + 세부 정보는 확장 시 노출
  - 상세 패널 접근성 개선(`aria-expanded`, `aria-controls`) 및 읽기 순서 재구성
- `README.md`, `review_docs/requirements.md`, `review_docs/cautions.md`
  - 사용자 중심 상세 UX 원칙과 QA 포인트로 문서 동기화

## 추가 반영 (보안/인덱싱 제어 및 주석 가이드)

- `middleware.ts`, `src/app/robots.ts`, `SECURITY.md`
  - `/api/*`, `/watchlist`에 대한 검색엔진 인덱싱 제어(`robots`, `X-Robots-Tag`) 추가
- `AGENTS.md`, `src/app/api/recommendations/route.ts`, `src/components/scenario-explorer.tsx`
  - 복잡 로직(스코어링/fallback/디바운스/저장 상한)에 대한 유지보수 주석 기준 반영 및 핵심 주석 추가
