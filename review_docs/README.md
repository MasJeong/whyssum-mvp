# 작업 검토 문서

이 폴더는 최근 작업 내용을 빠르게 검토할 수 있도록 정리한 문서 모음입니다.

## 문서 구성

- `changed-files.md`: 수정/추가된 파일과 변경 목적
- `cautions.md`: 검토 시 확인해야 할 주의사항과 후속 작업
- `requirements.md`: 웹사이트형 제품 요구사항과 구현 매핑
- `backend-review-guide.md`: 백엔드 관점에서 전체 구현을 검토하는 가이드
- `phase3-implementation-plan.md`: 고도화 기능 구현 계획서
- `briefing-implementation-plan.md`: 트렌드 브리핑 기능 구현 계획서
- `briefing-revisit-hub-implementation-plan.md`: 브리핑 재방문 허브 고도화 계획서
- `briefing-kpi-report-template.md`: 브리핑 KPI 주간 리포트 템플릿
- `compare-advanced-mode-implementation-plan.md`: 비교 고급 모드(4/8) 구현 계획서
- `trend-schedule-implementation-plan.md`: 트렌드 스케줄 업데이트 구현 계획서
- `trend-schedule-cron-operations.md`: 트렌드 스케줄 크론 운영/검증 가이드
- `react-next-onboarding.md`: React/Next 구조와 추천 흐름 온보딩 가이드
- `restore-volume-stress-checklist.md`: 복원/볼륨제어 스트레스 검증 시나리오
- `trust-freshness-copy-guide.md`: 신뢰도/신선도 문구 정렬 가이드
- `commit-unit-guideline.md`: 커밋 작업 단위 운영 기준
- `growth-experiment-runbook.md`: 성장 KPI 운영/리뷰 런북

## 운영 기록 규칙

- 작업 완료 시 커밋/푸시는 기본으로 수행한다.
- 커밋/푸시가 완료된 작업은 같은 라운드에서 관련 md 문서(`README.md`, `review_docs/changed-files.md`, `review_docs/cautions.md`)를 함께 최신화한다.
- 브랜치는 `main` 기준으로 운영하고, 커밋 메시지는 `type: 한글 설명` 규칙을 유지한다.

## 검토 순서 추천

1. `changed-files.md`로 파일별 변경 의도 파악
2. `cautions.md`로 리스크/보완 포인트 확인
3. 실제 코드 파일 열어 세부 로직/스타일 검토
