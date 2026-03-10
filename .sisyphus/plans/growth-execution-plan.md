# Growth Execution Plan (Traffic, Activation, Retention, Ad Readiness)

## TL;DR

> **Quick Summary**: Build a measurable growth loop for a free, ad-supported product by instrumenting the funnel, strengthening internal distribution, improving shareability, increasing return visits, and running CLS-safe ad optimization.
>
> **Deliverables**:
> - Event instrumentation spec + implementation
> - Related-content recommendation module on high-traffic pages
> - Snapshot-based share URLs for scenario/compare results
> - Revisit widget (“since last visit”)
> - Ad slot A/B framework + KPI reporting baseline
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 3 waves + final verification
> **Critical Path**: T1 -> T2/T3 -> T6 -> T9 -> F1-F4

---

## Context

### Original Request
사용자 유입을 늘리고, 행동을 유도하고, 재방문을 유지할 수 있도록 기획/분석/조사를 반영한 실행 플랜 요청.

### Interview Summary
**Key Discussions**:
- 무료 운영 + 광고 수익 모델에서 핵심 목표는 트래픽과 재방문.
- 즉시 효과가 나는 항목으로 이벤트 측정, 내부 링크 강화, 공유, 재방문, 광고 슬롯 최적화를 우선.

**Research Findings**:
- Oracle: SEO/공유/재방문 훅/CLS-safe 광고가 단기 ROI 최상.
- Creative consultation: 공유 가능한 결과 단위(요약/스냅샷/하이라이트)가 유입 루프 강화.

### Metis Review
**Identified Gaps (addressed)**:
- 측정 없이 기능만 추가하는 리스크 -> 이벤트/KPI를 Wave 1 선행.
- 광고 최적화 시 UX 훼손 리스크 -> CLS/가림형 광고 금지 가드레일 명시.
- 범위 확장 리스크 -> 인증/결제/외부 유료도구 도입을 명시적으로 제외.

---

## Work Objectives

### Core Objective
30일 내 성장 실험이 가능한 구조를 만들고, 유입-활성화-재방문 퍼널의 병목을 계량적으로 개선한다.

### Concrete Deliverables
- 퍼널 이벤트 계측 + KPI 대시보드용 집계 기준
- 페이지/세션 증가를 위한 관련 콘텐츠 링크 모듈
- 공유 가능한 결과 스냅샷 URL 생성/조회
- 재방문 인지 위젯
- 광고 슬롯 A/B 운영 훅(variant, position, CTR baseline)

### Definition of Done
- [ ] 핵심 이벤트 10개 이상이 코드에 반영되고 문서화됨
- [ ] `/scenarios` 및 `/compare`에서 스냅샷 공유 URL 생성/재조회 가능
- [ ] 주요 페이지에 관련 콘텐츠 모듈 반영
- [ ] 재방문 위젯 노출/미노출 조건 동작 확인
- [ ] 광고 슬롯 A/B variant가 반영되고 이벤트 집계 가능

### Must Have
- 무인증 환경에서 작동
- 기존 UX 패턴/톤 유지
- lint/build 통과

### Must NOT Have (Guardrails)
- 결제/로그인/유료 SaaS 도입 금지
- 침습형 광고(가림, 자동재생, 강제 인터럽트) 금지
- 측정 정의 없이 기능만 배포 금지

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: YES (lint/build 중심)
- **Automated tests**: Tests-after (필요 시 경량 추가)
- **Framework**: Next.js + TypeScript (lint/build 명령)

### QA Policy
- Frontend/UI: Playwright 시나리오 기반 검증
- API: curl 기반 응답/헤더/오류 검증
- Modules: 명령형 검증 + 라우트 동작 확인
- Evidence path: `.sisyphus/evidence/task-{N}-{scenario}.txt|png|json`

---

## Execution Strategy

### Parallel Execution Waves

Wave 1 (Start Immediately — measurement foundation):
- T1. Growth event taxonomy + logger utility
- T2. KPI aggregation contract + dashboard-ready schema
- T3. Ad experiment config contract (variant/placement)
- T4. Snapshot ID schema + storage abstraction
- T5. Related-content ranking utility

Wave 2 (After Wave 1 — product surface integration):
- T6. Instrument key funnel events on major routes
- T7. Related-content module integration on core pages
- T8. Snapshot share creation + resolve API
- T9. Revisit widget integration (since-last-visit)
- T10. Ad slot A/B exposure/click event integration

Wave 3 (After Wave 2 — polish + analytics readiness):
- T11. KPI report page or endpoint for recent metrics
- T12. Growth experiment playbook docs + operational runbook

Wave FINAL (After ALL tasks — independent review, 4 parallel):
- F1. Plan compliance audit (oracle)
- F2. Code quality review (unspecified-high)
- F3. Real manual QA execution (unspecified-high)
- F4. Scope fidelity check (deep)

Critical Path: T1 -> T2 -> T6 -> T11 -> F1/F2/F3/F4

### Dependency Matrix
- T1: blocked by none -> blocks T6, T10, T11
- T2: blocked by T1 -> blocks T11
- T3: blocked by none -> blocks T10
- T4: blocked by none -> blocks T8
- T5: blocked by none -> blocks T7
- T6: blocked by T1 -> blocks T11
- T7: blocked by T5 -> blocks T11
- T8: blocked by T4 -> blocks T11
- T9: blocked by none -> blocks T11
- T10: blocked by T1, T3 -> blocks T11
- T11: blocked by T2, T6, T7, T8, T9, T10 -> blocks final wave
- T12: blocked by T11 -> blocks final wave

### Agent Dispatch Summary
- Wave 1: T1 `unspecified-high`, T2 `deep`, T3 `quick`, T4 `unspecified-high`, T5 `quick`
- Wave 2: T6 `unspecified-high`, T7 `visual-engineering`, T8 `deep`, T9 `visual-engineering`, T10 `unspecified-high`
- Wave 3: T11 `deep`, T12 `writing`
- Final: F1 `oracle`, F2 `unspecified-high`, F3 `unspecified-high`, F4 `deep`

---

## TODOs

- [ ] 1. Define growth event taxonomy and logger utility

  **What to do**:
  - Define event names for acquisition/activation/retention/ad.
  - Implement shared logger wrapper used by route/page actions.

  **Must NOT do**:
  - Do not add third-party paid analytics SDK.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high` (cross-cutting instrumentation)
  - **Skills**: [`git-master`] (clean atomic changes)

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: T6, T10, T11
  - **Blocked By**: None

  **References**:
  - `src/app/page.tsx` - top funnel entry actions
  - `src/components/scenario-explorer.tsx` - activation-heavy interactions
  - `src/components/compare-interactive.tsx` - comparison completion events

  **Acceptance Criteria**:
  - [ ] Event map document includes at least 10 events.
  - [ ] Logger utility is imported and used in at least 3 modules.

  **QA Scenarios**:
  - Scenario: Home -> Role -> Scenario action logs
    Tool: Playwright
    Steps: Open `/`, click `1분 시작하기`, select role, click scenario CTA.
    Expected Result: event payloads captured in console/network log.
    Evidence: `.sisyphus/evidence/task-1-home-role-scenario.txt`
  - Scenario: Invalid event payload rejected
    Tool: Bash
    Steps: call logger with invalid schema in local harness.
    Expected Result: safe no-op or validation error without crash.
    Evidence: `.sisyphus/evidence/task-1-invalid-event-error.txt`

- [ ] 2. Define KPI aggregation contract

  **What to do**:
  - Create KPI schema: sessions, activation rate, share rate, revisit rate, ad CTR.
  - Define rolling windows (D1, D7, D30).

  **Must NOT do**:
  - Do not expose sensitive per-user raw data.

  **Parallelization**: Wave 1, blocked by T1

  **References**:
  - `src/app/briefings/page.tsx`
  - `src/app/compare/page.tsx`

  **Acceptance Criteria**:
  - [ ] KPI schema documented with formula and denominator.
  - [ ] At least one endpoint/report consumes schema.

  **QA Scenarios**:
  - Scenario: KPI sample aggregation
    Tool: Bash
    Steps: run aggregation script/endpoint with fixture events.
    Expected Result: derived metrics match expected values.
    Evidence: `.sisyphus/evidence/task-2-kpi-aggregation.json`
  - Scenario: Missing denominator handling
    Tool: Bash
    Steps: run with zero-session fixture.
    Expected Result: no divide-by-zero crash; explicit 0 or null policy.
    Evidence: `.sisyphus/evidence/task-2-zero-denominator.txt`

- [ ] 3. Add ad experiment configuration contract

  **What to do**: Define variant keys, placement map, and default fallback.
  **Must NOT do**: Do not introduce layout shift.
  **Parallelization**: Wave 1 (independent)

  **References**:
  - `src/components/ad-slot.tsx`
  - `src/app/globals.css`

  **Acceptance Criteria**:
  - [ ] Variant config supports A/B at minimum.
  - [ ] Default fallback variant exists.

  **QA Scenarios**:
  - Scenario: Variant A/B render
    Tool: Playwright
    Steps: force variant A then B via config flag.
    Expected Result: correct slot variant label/render appears.
    Evidence: `.sisyphus/evidence/task-3-variant-render.png`
  - Scenario: Unknown variant fallback
    Tool: Playwright
    Steps: inject invalid variant.
    Expected Result: fallback slot renders without breakage.
    Evidence: `.sisyphus/evidence/task-3-fallback.png`

- [ ] 4. Implement snapshot storage abstraction

  **What to do**: Create short snapshot ID format and storage/read contract for shared results.
  **Parallelization**: Wave 1 (independent)

  **References**:
  - `src/components/scenario-explorer.tsx`
  - `src/components/compare-interactive.tsx`

  **Acceptance Criteria**:
  - [ ] Snapshot create/read contract documented and implemented.
  - [ ] TTL or cleanup policy defined.

  **QA Scenarios**:
  - Scenario: Create and resolve snapshot
    Tool: Bash (curl)
    Steps: POST snapshot payload, GET by snapshot ID.
    Expected Result: same core payload returned.
    Evidence: `.sisyphus/evidence/task-4-snapshot-roundtrip.json`
  - Scenario: Expired or invalid snapshot ID
    Tool: Bash (curl)
    Steps: query invalid/expired ID.
    Expected Result: safe 404/410 with structured error.
    Evidence: `.sisyphus/evidence/task-4-invalid-snapshot.json`

- [ ] 5. Build related-content ranking utility

  **What to do**: rank related items by role/tag/intent to increase next-click probability.
  **Parallelization**: Wave 1 (independent)

  **References**:
  - `src/lib/mvp-data.ts`
  - `src/lib/briefing-data.ts`

  **Acceptance Criteria**:
  - [ ] Utility returns top 3 related links for each context.
  - [ ] Tie-break rule documented.

  **QA Scenarios**:
  - Scenario: Role-specific relevance
    Tool: Bash
    Steps: run utility with backend/designer/pm context fixtures.
    Expected Result: top results differ by role and remain stable.
    Evidence: `.sisyphus/evidence/task-5-related-by-role.json`
  - Scenario: Sparse data fallback
    Tool: Bash
    Steps: run with minimal tag set.
    Expected Result: fallback suggestions returned.
    Evidence: `.sisyphus/evidence/task-5-fallback.json`

- [ ] 6. Instrument key funnel events on core routes

  **What to do**: Wire event logging to home, roles, trends, scenarios, compare, briefings, insights CTAs.
  **Parallelization**: Wave 2 (blocked by T1)
  **References**: `src/app/page.tsx`, `src/app/roles/page.tsx`, `src/app/trends/[role]/page.tsx`, `src/app/scenarios/[role]/page.tsx`, `src/app/compare/page.tsx`
  **Acceptance Criteria**:
  - [ ] At least 10 mapped events emitted from route interactions.
  - [ ] Event names and payload schema match T1 document.
  **QA Scenarios**:
  - Scenario: Core CTA click path emits expected events; Evidence `.sisyphus/evidence/task-6-cta-events.txt`
  - Scenario: Duplicate rapid clicks are deduplicated/throttled; Evidence `.sisyphus/evidence/task-6-dedupe.txt`

- [ ] 7. Integrate related-content module on home/trends/scenarios/briefings/insights

  **What to do**: Add “다음으로 보기” module with top 3 role-aware links.
  **Parallelization**: Wave 2 (blocked by T5)
  **References**: `src/app/page.tsx`, `src/app/insights/page.tsx`, `src/app/briefings/page.tsx`
  **Acceptance Criteria**:
  - [ ] Related module visible on 5 target routes.
  - [ ] Links are valid and context-relevant.
  **QA Scenarios**:
  - Scenario: Backend context shows backend-leaning links; Evidence `.sisyphus/evidence/task-7-related-backend.png`
  - Scenario: Missing data fallback shows generic links; Evidence `.sisyphus/evidence/task-7-related-fallback.png`

- [ ] 8. Add snapshot share links for scenario/compare results

  **What to do**: Generate share URL with snapshot ID and resolve it on load.
  **Parallelization**: Wave 2 (blocked by T4)
  **References**: `src/components/scenario-explorer.tsx`, `src/components/compare-interactive.tsx`
  **Acceptance Criteria**:
  - [ ] Snapshot URL can be copied and reopened with same key result state.
  - [ ] Invalid snapshot IDs show safe fallback message.
  **QA Scenarios**:
  - Scenario: Create snapshot and open in new tab reproducing state; Evidence `.sisyphus/evidence/task-8-share-roundtrip.txt`
  - Scenario: Unknown snapshot ID returns graceful error banner; Evidence `.sisyphus/evidence/task-8-share-invalid.png`

- [ ] 9. Add revisit widget for “since last visit” across key pages

  **What to do**: Display change summary based on local last-visit timestamp.
  **Parallelization**: Wave 2 (independent)
  **References**: `src/components/briefing-return-badge.tsx`, `src/app/briefings/page.tsx`, `src/app/page.tsx`
  **Acceptance Criteria**:
  - [ ] First visit hides widget.
  - [ ] Second visit with updates shows accurate count.
  **QA Scenarios**:
  - Scenario: First-time visitor sees no badge; Evidence `.sisyphus/evidence/task-9-first-visit.txt`
  - Scenario: Returning visitor sees count > 0 after seeded update; Evidence `.sisyphus/evidence/task-9-return-visit.txt`

- [ ] 10. Integrate ad slot A/B exposure and click tracking

  **What to do**: Attach exposure/click events with variant and slot metadata.
  **Parallelization**: Wave 2 (blocked by T1, T3)
  **References**: `src/components/ad-slot.tsx`, `src/app/globals.css`, `src/app/layout.tsx`
  **Acceptance Criteria**:
  - [ ] Exposure logged once per visible impression.
  - [ ] Click event includes slot ID and variant.
  **QA Scenarios**:
  - Scenario: Slot visibility triggers one exposure event; Evidence `.sisyphus/evidence/task-10-exposure.txt`
  - Scenario: Rapid rerender does not duplicate exposure flood; Evidence `.sisyphus/evidence/task-10-dup-guard.txt`

- [ ] 11. Build KPI report endpoint/page for D1/D7/D30

  **What to do**: Expose aggregate metrics for growth review cadence.
  **Parallelization**: Wave 3 (blocked by T2, T6-T10)
  **References**: `src/app/briefings/page.tsx`, `src/app/insights/page.tsx`
  **Acceptance Criteria**:
  - [ ] Report includes activation/share/revisit/ad CTR baseline.
  - [ ] Date-window query validates inputs safely.
  **QA Scenarios**:
  - Scenario: Query D7 returns complete metric object; Evidence `.sisyphus/evidence/task-11-d7-report.json`
  - Scenario: Invalid window param returns 400-safe response; Evidence `.sisyphus/evidence/task-11-invalid-window.json`

- [ ] 12. Publish growth experiment runbook and weekly review checklist

  **What to do**: Document rollout, rollback, KPI review, and stop/go rules.
  **Parallelization**: Wave 3 (blocked by T11)
  **References**: `review_docs/requirements.md`, `review_docs/cautions.md`, `README.md`
  **Acceptance Criteria**:
  - [ ] Runbook includes owner, cadence, KPI thresholds, rollback trigger.
  - [ ] Weekly checklist includes evidence collection path.
  **QA Scenarios**:
  - Scenario: New operator can execute review steps end-to-end; Evidence `.sisyphus/evidence/task-12-runbook-walkthrough.txt`
  - Scenario: Missing metric data path has fallback procedure; Evidence `.sisyphus/evidence/task-12-missing-data.txt`

---

## Final Verification Wave (MANDATORY)

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npm run lint` and `npm run build`, check anti-patterns.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | VERDICT`

- [ ] F3. **Real QA Execution** — `unspecified-high` (+ `playwright` if UI)
  Execute all QA scenarios and verify evidence files exist.
  Output: `Scenarios [N/N pass] | Integration [N/N] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  Validate no scope creep beyond defined growth tasks.
  Output: `Tasks [N/N compliant] | Unaccounted [CLEAN/N] | VERDICT`

---

## Commit Strategy

- Commit in small atomic slices by wave task group.
- Message format follows repository style.
- Keep growth infra (events/KPI) separate from UI integrations for easier rollback.

---

## Success Criteria

### Verification Commands
```bash
npm run lint
npm run build
```

### Final Checklist
- [ ] All Must Have items implemented
- [ ] All Must NOT Have constraints respected
- [ ] Funnel baseline metrics calculable (D1/D7/D30)
- [ ] Share snapshot flow works end-to-end
- [ ] Revisit widget increases repeat-entry visibility
