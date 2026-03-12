# 트렌드 스케줄 크론 운영 가이드

## 목적

`/api/trends/schedule`를 운영 크론에 연결해 주기 갱신을 안정적으로 실행하고,
실패를 빠르게 감지할 수 있는 최소 운영 절차를 정의한다.

## 대상 엔드포인트

- 상태 조회: `GET /api/trends/schedule`
- 실행 트리거: `POST /api/trends/schedule`

## 권장 운영 정책

- 주기: 하루 2회 (KST 09:10, 21:10)
- 타임아웃: 60초
- 재시도: 실패 시 1회(3분 후)
- 비밀키: `TRENDS_CRON_SECRET` 필수 적용

## 환경 변수

- `TRENDS_CRON_SECRET`: 크론 호출 인증 키
- `TRENDS_ALERT_WEBHOOK_URL`: 실패/fallback 실행 시 알림을 받을 운영 웹훅(선택)

## GitHub Actions Cron 예시

```yaml
name: whyssum-trend-schedule

on:
  schedule:
    - cron: "10 0,12 * * *"
  workflow_dispatch:

jobs:
  trigger:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger schedule endpoint
        env:
          BASE_URL: ${{ secrets.WHYSSUM_BASE_URL }}
          CRON_SECRET: ${{ secrets.TRENDS_CRON_SECRET }}
        run: |
          curl --fail --show-error --silent \
            -X POST "${BASE_URL}/api/trends/schedule" \
            -H "x-cron-secret: ${CRON_SECRET}" \
            -H "Accept: application/json"
```

## 검증 시나리오

1. **무인증 차단 확인**
   - 조건: `TRENDS_CRON_SECRET` 설정된 환경
   - 동작: 비밀키 없이 `POST /api/trends/schedule`
   - 기대: `401`

2. **정상 실행 확인**
   - 동작: 올바른 `x-cron-secret`로 `POST /api/trends/schedule`
   - 기대: `200`, `results[].role/mode/metricCount` 포함

3. **상태 조회 확인**
   - 동작: `GET /api/trends/schedule`
   - 기대: `lastRunAt`, `lastDurationMs`, `lastSuccess`, `lastResults`, `history`, `persistenceMode` 갱신

4. **부분 fallback 관측 확인**
   - 동작: 외부 API 실패 상황(레이트리밋)에서 실행
   - 기대: `results` 일부 role의 `mode: fallback` 가능, 전체 API는 정상 응답

## 운영 점검 체크리스트

- 최근 24시간 내 최소 1회 `lastSuccess=true`가 확인되는가
- `lastDurationMs`가 급격히 증가하지 않았는가
- `lastResults`에서 특정 role만 반복 fallback되는가
- `history[0].alertStatus`가 실패 없이 기대대로 갱신되는가
- 장애 시 수동 트리거(`workflow_dispatch`)로 복구 가능한가

## 주의사항

- 실행 이력은 파일 저장을 우선 시도하고, 실패 시 메모리 모드로 자동 폴백된다.
- 웹훅 알림은 선택 사항이며, 미설정 시 `alertStatus: skipped`가 정상이다.
