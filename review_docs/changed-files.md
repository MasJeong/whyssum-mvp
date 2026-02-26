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
