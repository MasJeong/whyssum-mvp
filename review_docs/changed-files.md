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

## 추가 반영 (UI/UX 현대화 1차)

- `src/app/globals.css`
  - 의미 기반 텍스트 토큰/타이포 스케일 조정
  - 전역 포커스 가시성, 버튼/필 탭 터치 타깃, 표 가독성(sticky 첫 열/hover) 강화
  - 공통 유틸 클래스(`readable`, `mt-*`, `stack-*`, `sr-only`) 추가
- `src/app/page.tsx`, `src/app/roles/page.tsx`, `src/app/compare/page.tsx`, `src/app/scenarios/[role]/page.tsx`, `src/app/trends/[role]/page.tsx`
  - 본문 가독성(`readable`) 및 인라인 마진 스타일 일부 공통 클래스 치환
- `src/components/scenario-explorer.tsx`, `src/components/compare-interactive.tsx`
  - 상세/저장 UI 간격 체계 정리 및 비교표 접근성 캡션 추가
- `README.md`, `review_docs/requirements.md`, `review_docs/cautions.md`
  - UI/UX 현대화 1차 반영 내용 및 QA 체크포인트 동기화

## 추가 반영 (UI/UX 현대화 2차 - clarity-first)

- `src/components/scenario-explorer.tsx`
  - 현재 조건 기반 1순위를 즉시 이해할 수 있는 "한 줄 결론" 배너 추가
- `src/components/compare-interactive.tsx`
  - 선택 항목에 대한 균형 점수 기반 "비교 요약" 배너 추가
- `src/app/globals.css`, `src/app/page.tsx`, `src/app/scenarios/[role]/page.tsx`
  - 배너/간격 유틸 클래스 추가 및 인라인 간격 스타일 일부 정리
- `README.md`, `review_docs/requirements.md`, `review_docs/cautions.md`
  - 2차 UX 개선 의도와 QA 항목 문서 동기화

## 추가 반영 (전역 함수 JSDoc 정비)

- `src/**/*.ts`, `src/**/*.tsx`, `middleware.ts`
  - 함수/메서드 단위 JSDoc를 한국어 중심으로 전수 정비
  - 페이지/컴포넌트/API/유틸의 named function 누락 항목 보강
- `review_docs/requirements.md`, `review_docs/cautions.md`
  - 주석 정책(함수 JSDoc 필수)과 검증 포인트 반영

## 추가 반영 (상용화 UX 리서치 기반 개선)

- `src/app/globals.css`
  - 블루/민트 기반 브랜드 토큰 재정의 및 상호작용 상태(버튼/카드/탭) 대비 강화
  - 모바일 하단 탭에 아이콘/타이포 계층 반영, 시각 스캔 속도 개선
- `src/app/page.tsx`, `src/app/roles/page.tsx`
  - 첫 화면 가치 제안/CTA 문구를 의사결정 중심으로 재작성
  - 역할 페이지 헤더 카피를 중복 제거하고 실사용 흐름 안내로 교체
- `src/components/mobile-sticky-cta.tsx`
  - 모바일 CTA가 현재 문맥(role) 기준으로 진입 경로를 선택하도록 개선
- `src/app/scenarios/[role]/page.tsx`, `src/components/scenario-explorer.tsx`
  - "자주 찾는 상황" 칩을 실제 프리셋 링크로 전환
  - URL 쿼리(teamSize/timeline/priority) 기반 초기 필터 복원 지원
- `src/app/trends/[role]/page.tsx`, `src/components/compare-interactive.tsx`, `src/components/mobile-bottom-nav.tsx`
  - 개발자용 용어(LIVE/FALLBACK) 사용자 친화 문구로 정리
  - 비교 선택 수량(현재 n/4) 노출로 제약 인지성 강화

## 추가 반영 (색감/아이콘 체계 2차 정돈)

- `src/app/globals.css`
  - 토스식 신뢰 톤에 맞춰 primary 버튼/모바일 CTA 그라디언트를 블루 중심으로 단순화
  - 신뢰도 배지 색상 토큰(`--trust-yellow`, `--trust-red`) 추가 및 일관 적용
  - 버튼/내비 공통 아이콘 슬롯(`.button-icon`)과 compact 버튼 유틸(`.button-compact`) 추가
- `src/components/nav-links.tsx`, `src/components/mobile-bottom-nav.tsx`
  - 텍스트 중심 내비를 의미 기반 SVG 아이콘+라벨 구조로 전환
- `src/app/page.tsx`, `src/app/roles/page.tsx`, `src/app/scenarios/[role]/page.tsx`, `src/app/trends/[role]/page.tsx`, `src/components/briefing-board.tsx`, `src/components/scenario-explorer.tsx`
  - 주요 CTA에 의미 기반 아이콘을 추가해 스캔 속도/행동 예측성 강화
  - 브리핑/시나리오의 인라인 스타일을 공통 유틸 클래스로 치환해 유지보수성 개선

## 추가 반영 (유입/재방문 루프 1차)

- `src/app/api/subscribe/route.ts`
  - 이메일 구독 API 추가(요청 검증 + rate limit + 중복 구독 처리)
- `src/lib/security/validation.ts`
  - 구독 바디 검증 스키마(`subscribeBodySchema`) 및 파서 추가
- `src/components/newsletter-capture.tsx`, `src/app/page.tsx`
  - 홈 화면 구독 폼 + 빠른 시작 체크리스트 추가
- `src/components/scenario-explorer.tsx`, `src/components/compare-interactive.tsx`
  - 공유 링크 복사/요약 복사 액션 추가
  - 로딩 시 스켈레톤 상태 추가
- `src/components/briefing-board.tsx`
  - 브리핑 로딩 스켈레톤 추가
- `src/components/watchlist-view.tsx`
  - 관심리스트 JSON 내보내기/가져오기 기능 추가
- `src/app/globals.css`
  - 구독 폼/빠른 시작/스켈레톤 공통 스타일 추가

## 추가 반영 (트래픽 성장 + 광고 운영 준비)

- `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/roles/page.tsx`, `src/app/compare/page.tsx`, `src/app/briefings/page.tsx`, `src/app/insights/page.tsx`, `src/app/trends/[role]/page.tsx`, `src/app/scenarios/[role]/page.tsx`
  - 페이지별 SEO 메타 강화(canonical, title/description, 동적 메타)
  - 홈 FAQ JSON-LD, RSS 진입, 관련 행동 유도 링크 확장
  - 주요 화면에 광고 슬롯 컴포넌트 연결
- `src/components/ad-slot.tsx`, `src/components/briefing-return-badge.tsx`
  - CLS-safe 광고 슬롯 컴포넌트 추가
  - 브리핑 재방문 시 신규 항목 배지 추가(localStorage 기반)
- `src/app/sitemap.ts`, `src/app/manifest.ts`, `src/app/feed.xml/route.ts`, `src/app/robots.ts`
  - sitemap/manifest/rss 라우트 추가
  - robots에 sitemap 링크 및 공개 경로 확장
- `src/app/advertising/page.tsx`, `src/app/privacy/page.tsx`
  - 광고/개인정보 안내 페이지 신규 추가
- `src/app/globals.css`
  - 광고 슬롯 스타일 시스템 추가

## 추가 반영 (성장 측정 + 공유 스냅샷 1차)

- `src/lib/growth-events.ts`, `src/lib/growth-kpis.ts`, `src/lib/growth-store.ts`
  - 성장 이벤트 택소노미, 로컬/서버 수집, KPI 집계 계약 추가
- `src/app/api/growth-events/route.ts`, `src/app/api/growth-kpis/route.ts`
  - 이벤트 수집 API 및 D1/D7/D30 KPI 리포트 API 추가
- `src/lib/share-snapshots.ts`, `src/lib/share-snapshot-store.ts`, `src/app/api/snapshots/route.ts`, `src/app/api/snapshots/[snapshotId]/route.ts`
  - 상황추천/비교 공유 스냅샷 저장/조회 API 추가
- `src/lib/related-content.ts`, `src/components/related-content-section.tsx`
  - 관련 콘텐츠 추천 로직 및 공통 섹션 추가
- `src/components/tracked-link.tsx`, `src/components/page-visit-tracker.tsx`
  - 주요 페이지/링크 클릭 계측 컴포넌트 추가
- `src/components/scenario-explorer.tsx`, `src/components/compare-interactive.tsx`
  - 스냅샷 공유 URL 생성/복원 및 핵심 이벤트 계측 반영
- `src/app/page.tsx`, `src/app/roles/page.tsx`, `src/app/trends/[role]/page.tsx`, `src/app/scenarios/[role]/page.tsx`, `src/app/compare/page.tsx`, `src/app/briefings/page.tsx`, `src/app/insights/page.tsx`
  - page_view/CTA 추적 및 관련 콘텐츠 섹션 연결

## 추가 반영 (성장 대시보드 + 재방문 확장)

- `src/app/growth/page.tsx`
  - D1/D7/D30 KPI 카드와 상위 이벤트 목록을 보여주는 운영 대시보드 추가
- `src/components/page-return-badge.tsx`
  - 페이지별 마지막 방문 시각을 localStorage 기준으로 읽어 재방문 배지 노출
- `src/app/page.tsx`, `src/app/roles/page.tsx`, `src/app/trends/[role]/page.tsx`, `src/app/scenarios/[role]/page.tsx`, `src/app/compare/page.tsx`, `src/app/insights/page.tsx`
  - 핵심 페이지에 재방문 배지 연결
- `src/components/nav-links.tsx`, `src/app/layout.tsx`
  - 상단/푸터에 성장 대시보드 진입 링크 추가
- `review_docs/growth-experiment-runbook.md`
  - KPI 운영 cadence, stop/go, rollback 기준 문서화
