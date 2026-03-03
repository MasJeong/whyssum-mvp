# 트렌드 스케줄 업데이트 구현 계획서

## 목적

트렌드 데이터를 수동 조회 시점에만 갱신하지 않고, 정해진 주기로 미리 갱신할 수 있는 실행 경로를 만든다.

## 배경 문제

- 현재는 사용자 요청 시점 중심으로 데이터가 갱신되어, 초기 응답에서 외부 소스 지연이 발생할 수 있다.
- 운영 관점에서 "최근 갱신 성공 여부"를 확인할 수 있는 상태 API가 없다.

## 목표

1. 외부 스케줄러(예: GitHub Actions/Vercel Cron)가 호출할 수 있는 트렌드 갱신 엔드포인트를 제공한다.
2. 최근 실행 결과(시각/소요시간/성공여부)를 조회할 수 있는 상태 API를 제공한다.
3. 비밀키를 통한 보호 옵션을 지원해 임의 호출 위험을 줄인다.

## 범위

### 포함

- `POST /api/trends/schedule`: 전체 직무 트렌드 갱신 실행
- `GET /api/trends/schedule`: 최근 실행 상태 조회
- 환경변수 `TRENDS_CRON_SECRET` 기반 보호
- 문서 최신화(`README.md`, `review_docs/changed-files.md`, `review_docs/cautions.md`, `review_docs/requirements.md`)

### 제외

- 서버 내부 setInterval 기반 상시 스케줄러
- DB 기반 영구 실행 이력 저장
- 알림(Slack/Email) 연동

## 설계

1. 라이브러리 확장 (`src/lib/live-role-trends.ts`)
   - 전체 직무 갱신 함수 `refreshAllRoleTrendMetrics()` 추가
   - 역할별 결과(mode/metricCount) 반환

2. 스케줄 API (`src/app/api/trends/schedule/route.ts`)
   - `GET`: 마지막 실행 상태 반환
   - `POST`: 비밀키 검증 후 전체 갱신 실행
   - 실행 메타(lastRunAt, lastDurationMs, lastSuccess, perRole)를 메모리에 유지

3. 보안
   - `TRENDS_CRON_SECRET`가 설정되면 `x-cron-secret` 헤더 또는 `?secret=` 쿼리와 일치해야 실행 허용
   - 미일치 시 401 반환

## 수용 기준

- `POST /api/trends/schedule` 호출 시 각 직무 갱신 결과가 응답된다.
- `GET /api/trends/schedule`에서 마지막 실행 상태를 확인할 수 있다.
- 비밀키 설정 시 잘못된 키로 호출하면 401을 반환한다.
- 문서가 최신화된다.

## 리스크 및 대응

- 메모리 상태는 프로세스 재시작 시 초기화
  - 대응: 문서에 "운영 로그 영구 저장은 후속"으로 명시
- 외부 소스 레이트리밋으로 일부 직무 fallback 가능
  - 대응: perRole 결과에 mode를 포함해 관측 가능하게 제공
