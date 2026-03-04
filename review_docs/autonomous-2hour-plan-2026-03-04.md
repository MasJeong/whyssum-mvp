# 2시간 자율 조사/계획 실행안 (2026-03-04)

## 목적

- 사용자 재방문 루프를 강화하고, 조건 기반 추천의 의사결정 전환율을 높이기 위한 **2시간 실행 우선순위**를 확정한다.
- 이미 구현된 기능(추천 카드 볼륨 제어, 시나리오/브리핑 복원)을 재구현하지 않고, **검증/계측/행동유도**에 집중한다.

## 현재 상태 요약 (코드 근거)

- 시나리오 복원/저장: `src/components/scenario-explorer.tsx`
  - 마지막 선택 복원(`whyssum:last-scenario-selection`), 스냅샷 저장(`whyssum:scenario-snapshots`)
  - 추천 카드 표시 제어(상위 3개/전체)
- 브리핑 복원/이벤트: `src/components/briefing-board.tsx`
  - 필터 복원(`whyssum:briefing:lastFilters`)
  - 이벤트 로깅(`briefing_view`, `briefing_filter_change`, `briefing_card_action_click`, `briefing_empty_state_recover`)
- 트렌드 신뢰/신선도: `src/app/trends/[role]/page.tsx`, `src/lib/live-role-trends.ts`
  - `mode(live/fallback)`, `source`, `fetchedAt`, `trustLevel`, `confidenceScore`
- 운영 스케줄: `src/app/api/trends/schedule/route.ts`
  - `GET/POST` 스케줄 상태/실행, 메모리 상태(재시작 시 초기화)

## 핵심 인사이트

1. **이미 구현된 것**
   - 추천 카드 과밀도 완화(상위 3개 기본)와 시나리오 복원은 준비되어 있다.
2. **가장 큰 공백**
   - Watchlist가 "보관함"에 가까워 다음 행동(비교/상황추천) 허브 기능이 약하다.
3. **검증 공백**
   - 브리핑 외 화면(시나리오/워치리스트/트렌드)의 이벤트 계측이 부족해 개선효과를 판단하기 어렵다.

## 2시간 우선순위 (Strict Sequence)

### P0-1. 계측 스펙 확정 (20분)

- 목표: "복원 사용률/전체보기 사용률/워치리스트 전환률"을 즉시 계산 가능하게 만든다.
- 최소 이벤트(권장):
  - `scenario_show_all_toggle`
  - `scenario_recommendation_expand`
  - `scenario_snapshot_save`
  - `scenario_snapshot_apply`
  - `watchlist_add`
  - `watchlist_remove`
  - `watchlist_cta_click`
  - `trust_help_open`
- 공통 속성:
  - `surface`, `role`, `timestamp`
  - 필요 시 `mode(live/fallback)`, `source`, `fetchedAt`
- 성공 기준:
  - 이벤트 정의표만으로 KPI 3종 계산식이 명확히 나온다.

### P0-2. Watchlist "다음 행동" 허브 설계 확정 (25분)

- 목표: `/watchlist`에서 1클릭으로 결정 단계로 이동한다.
- 필수 CTA 2개:
  - `비교로 이동`
  - `상황추천으로 이동`
- 성공 기준:
  - Watchlist 항목당 최소 2개 CTA가 정의되고, 사용자 재검색 없이 다음 단계 진입이 가능하다.

### P0-3. 복원/볼륨제어 스트레스 검증 시나리오 작성 (25분)

- 목표: 이미 있는 기능이 실제로 안정적으로 동작하는지 확인한다.
- 검증 대상:
  - 시나리오 복원(역할 전환/새로고침/재진입)
  - 브리핑 복원(필터 저장/복원)
  - 추천 카드 볼륨 제어(상위 3개 기본 + 전체 토글)
- 성공 기준:
  - 5회 반복 수동 점검에서 치명적 이탈(상태 유실/잘못된 복원) 0건.

### P0-4. 신뢰도/신선도 문구 정렬 가이드 확정 (20분)

- 목표: "실시간"으로 오해될 수 있는 문구를 줄이고, 지표 의미를 일관되게 노출한다.
- 원칙:
  - `live/fallback`는 데이터 출처/수집상태를 뜻함
  - `confidenceScore`는 휴리스틱 합성값임을 명시
- 성공 기준:
  - 화면별 문구 가이드 1안 완성(트렌드/시나리오/비교 공통 톤).

### P1. 외부 벤치마크 매핑(선택, 30분)

- 비교 레퍼런스 핵심만 반영:
  - Google Trends: 정규화 지표 + 구독/주기 알림
  - G2/TrustRadius: 비교 워크스페이스/리서치 보드
  - GitHub/Stack Overflow: watched 기반 재진입
  - GA4/Mixpanel: 인사이트/알림 기반 복귀 트리거
- 성공 기준:
  - "우리 제품에 바로 이식 가능한 항목"만 P0/P1로 분류 완료.

## KPI 설계 (초기)

- `Resume Rate`
  - 정의: 복원 진입 세션 / 전체 재방문 세션
- `Show-All Dependence`
  - 정의: 전체 보기 토글 세션 / 시나리오 세션
- `Watchlist Action Rate`
  - 정의: watchlist CTA 클릭 세션 / watchlist 진입 세션
- `Decision Progress Rate`
  - 정의: watchlist -> compare/scenario 전환 세션 / watchlist 세션

## 리스크 및 완화

- 로컬 저장 기반 한계
  - 리스크: 디바이스 간 연속성 없음
  - 완화: 제품 내 문구로 범위 명시(로컬 저장)
- 스케줄 상태 메모리 보관
  - 리스크: 서버 재시작 시 상태 초기화
  - 완화: 운영 가이드에 재시작 후 점검 체크리스트 유지
- 계측 미비 상태에서 기능만 추가
  - 리스크: 성과 판단 불가
  - 완화: 기능 변경 전 이벤트 스키마 우선 확정

## 실행 종료 조건 (2시간 컷)

- P0-1~P0-4 산출물이 모두 문서화됨
- KPI 계산식과 이벤트 스키마가 연결됨
- 다음 구현 스프린트에서 바로 티켓 분해 가능한 수준으로 정리됨
