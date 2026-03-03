# 브리핑 KPI 주간 리포트 템플릿

## 리포트 정보

- 기준 주차: `YYYY-WW`
- 작성일: `YYYY-MM-DD`
- 작성자: `owner`

## 핵심 지표 요약

- `briefing_view` 총합: `N`
- `briefing_filter_change` 총합: `N`
- `briefing_card_action_click` 총합: `N`
- `briefing_empty_state_recover` 총합: `N`

## 전환 지표

- 브리핑 -> 상황추천 클릭률: `scenario_click / briefing_view`
- 브리핑 -> 트렌드 클릭률: `trends_click / briefing_view`
- 브리핑 -> 비교 클릭률: `compare_click / briefing_view`
- 브리핑 -> 원문 클릭률: `source_click / briefing_view`

## 인사이트

1. 잘된 점
   - 
2. 문제 구간
   - 
3. 다음 실험
   - 

## 상세 로그 샘플

```text
[briefing-event] briefing_view { role: "backend", impact: "all", periodDays: 30, count: 8 }
[briefing-event] briefing_filter_change { filter: "impact", value: "high" }
[briefing-event] briefing_card_action_click { action: "scenario", id: "bf-001", role: "backend" }
```

## 다음 주 액션 아이템

- [ ] 액션 1
- [ ] 액션 2
- [ ] 액션 3
