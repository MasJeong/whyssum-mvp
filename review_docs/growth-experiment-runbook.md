# 성장 실험 운영 런북

## 목적

- `src/app/growth/page.tsx`와 `GET /api/growth-kpis`를 기준으로 주간 성장 리뷰를 운영한다.
- 유입, 활성화, 공유, 재방문, 광고 효율을 같은 cadence로 확인하고 stop/go 판단을 빠르게 내린다.

## 운영 대상

- KPI 대시보드: `/growth`
- KPI API: `/api/growth-kpis?window=d1|d7|d30`
- 이벤트 수집 API: `/api/growth-events`

## Owner / Cadence

- Owner: 제품 운영 담당 1명 + 개발 담당 1명
- Daily quick check: 평일 오전 1회 (`D1`)
- Weekly review: 매주 1회 (`D7`, `D30`)
- Release checkpoint: 주요 UX 변경 직후 당일 재확인

## 확인 지표

1. Activation Rate
   - 기준: page view 이후 핵심 행동(직무 선택, 상황추천, 비교 선택) 진입 비율

2. Share Rate
   - 기준: 공유 링크/요약 복사 비율

3. Revisit Rate
   - 기준: 재방문 위젯 노출 비율

4. Ad Click Through Rate
   - 기준: 광고 노출 대비 클릭 비율

5. Newsletter Subscribe Rate
   - 기준: 세션 대비 구독 완료 비율

## Stop / Go 기준

- Go
  - Activation Rate 유지 또는 상승
  - Share Rate 하락 없음
  - Revisit Rate 상승 또는 신규 페이지 확장 후 안정 유지
  - 광고 CTR 상승과 UX 이슈 부재 동시 확인

- Stop
  - Activation Rate가 전주 대비 15% 이상 하락
  - Share Rate가 전주 대비 20% 이상 하락
  - 광고 CTR 상승과 함께 사용자 흐름 저하(이탈, 클릭 혼선) 발견
  - 재방문 위젯이 첫 방문에도 잘못 노출됨

## Rollback 트리거

- 광고 슬롯 variant 변경 후 핵심 CTA 클릭 감소가 동시에 관찰될 때
- 재방문 위젯 확장 후 화면 과밀/혼동 이슈가 발견될 때
- KPI 페이지/집계 로직 변경 후 `D1/D7/D30` 값이 비정상적으로 0 또는 급등할 때

## 운영 절차

1. `/growth`에서 D1, D7, D30을 순서대로 확인한다.
2. 상위 이벤트 목록에서 비정상 급증 이벤트가 있는지 본다.
3. 광고 CTR과 Activation Rate를 같이 본다.
4. Share/Revisit 변화가 있으면 최근 UI 변경점과 함께 기록한다.
5. 이상 징후가 있으면 릴리스 범위를 좁혀 롤백 후보를 정한다.

## 증거 수집 경로

- 스크린샷/응답 저장 경로: `.sisyphus/evidence/`
- 권장 파일 예시:
  - `.sisyphus/evidence/growth-d1.png`
  - `.sisyphus/evidence/growth-d7.json`
  - `.sisyphus/evidence/growth-d30.png`

## 데이터 공백 대응

- KPI가 모두 0이면 먼저 서버 재시작 여부를 확인한다.
- 현재 저장소는 메모리 기반이므로 재시작 후 누적 이벤트가 초기화될 수 있다.
- 이 경우 D1 기준으로 다시 수집을 시작하고, 운영 로그에 "memory reset"을 남긴다.

## 주간 리뷰 체크리스트

- [ ] `/growth` 로드 확인
- [ ] `D1/D7/D30` 응답 구조 확인
- [ ] Activation / Share / Revisit / Ad CTR / Newsletter 값 기록
- [ ] 상위 이벤트 5개 기록
- [ ] 이상 변동 유무 판단
- [ ] 필요 시 rollback 여부 결정
