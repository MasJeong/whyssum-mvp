# AGENTS.md

This file is for coding agents working in this repository.
Scope: whole repository.

## How to Use This Document

- Treat this file as the default execution contract for repository work.
- If instructions conflict, follow this precedence: direct user request > system/developer constraints > this file.
- Verify assumptions against real files before making changes.

## Project Snapshot

- App name: `whyssum`
- Stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, ESLint 9, Zod
- Runtime: Node.js 20+
- Package manager: npm
- Main branch: `main`

## Important Paths

- App routes: `src/app/`
- API routes: `src/app/api/`
- Shared libs: `src/lib/`
- UI components: `src/components/`
- Security notes: `SECURITY.md`
- Review docs: `review_docs/`

## Rule Files Check (Cursor/Copilot)

Checked and found none in this repository:

- `.cursorrules` -> not present
- `.cursor/rules/` -> not present
- `.github/copilot-instructions.md` -> not present

If these files are added later, update this document and follow them.

## Setup Commands

Install dependencies:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

Build production bundle:

```bash
npm run build
```

Start production server (after build):

```bash
npm run start
```

Run lint:

```bash
npm run lint
```

## Test Commands

Current state:

- No dedicated test runner is configured in `package.json` (no `test` script).
- Use lint + build as required verification gates.

Required validation before marking work done, committing, or opening a PR:

```bash
npm run lint
npm run build
```

Validation notes:

- Do not invent or run non-existent test commands in this repository.
- If a test framework is introduced later, add exact single-test commands here first.

## Coding Standards

### Language and Types

- Use strict TypeScript (`tsconfig` has `strict: true`).
- Prefer explicit, narrow types over `any`.
- Avoid type suppression (`@ts-ignore`, `@ts-expect-error`) unless explicitly approved.
- Keep API request/response types colocated with route logic when practical.
- If ESLint and TypeScript guidance appear to conflict, keep type safety first and resolve lint issues without disabling type checks.

### Imports

- Use alias imports via `@/*` for internal modules (`@/lib/...`, `@/components/...`).
- Group imports in this order:
  1. framework/external
  2. internal alias imports
  3. type-only imports (can be inline with TS style if cleaner)
- Remove unused imports.

### Naming

- Components: PascalCase (`ScenarioExplorer`, `NavLinks`).
- Files for components: kebab-case or descriptive lowercase already used in repo; keep consistency per folder.
- Variables/functions: camelCase.
- Constants: UPPER_SNAKE_CASE for true constants.
- Route segment params: keep existing naming (`role`).

### Formatting and Style

- Follow existing ESLint/Next style.
- Keep JSX readable with small sections and clear class names.
- Prefer composition via small components over giant page files.
- Keep inline styles minimal; prefer CSS classes in `globals.css`.

### React / Next.js Conventions

- Default to Server Components in `app/` unless interactivity is needed.
- Use `"use client"` only for interactive components.
- API handlers live under `src/app/api/**/route.ts`.
- For dynamic routes, follow the existing typed Promise params pattern used in `src/app/trends/[role]/page.tsx` and `src/app/scenarios/[role]/page.tsx`.

### Error Handling

- API routes must return structured JSON errors with appropriate status codes.
- Keep user-facing error messages safe and generic.
- Never leak stack traces in API responses.
- Preserve and update rate-limit headers where relevant.

### Security

- Keep middleware security headers intact.
- Do not modify security headers unless explicitly requested.
- Validate external input with Zod schemas.
- Treat all query params as untrusted input.
- Keep fallback behavior for external API failures.

### Data and External APIs

- Live trend ingestion uses GitHub public API logic in `src/lib/live-role-trends.ts`.
- Maintain fallback to `trendData` for resilience.
- If changing scoring formulas, update docs in `review_docs/` and `README.md`.

## Documentation Rules

When behavior, metrics, API contract, or UX flow changes:

1. Update `README.md` if public usage/API changed.
2. Update relevant files in `review_docs/`:
   - `changed-files.md`
   - `cautions.md`
   - `requirements.md`
   - `backend-review-guide.md` (if backend behavior changed)
   - `review_docs/README.md` (if doc structure/usage guidance changed)
   - `phase3-implementation-plan.md` (if implementation plan assumptions changed)
   - `briefing-implementation-plan.md` (if briefing plan assumptions changed)

Documentation should be updated in the same change set.

## Decision Guidelines

- If requirements are unclear and codebase context cannot disambiguate, ask one precise clarifying question.
- If standards conflict, prioritize security and data safety over convenience.
- If you discover repo instructions that appear outdated, note the discrepancy in your final message and follow the safest current behavior.
- Do not bypass validation gates (`npm run lint`, `npm run build`) to save time.

## Git Workflow Expectations

- Work on `main` unless instructed otherwise.
- For substantial changes intended for review, create a feature branch before opening a PR.
- Keep commits focused and descriptive.
- Do not rewrite published history unless explicitly requested.
- Before commit/push, ensure:
  - `npm run lint` passes
  - `npm run build` passes

## Quick Review Checklist for Agents

- Did I avoid introducing `any` and suppression comments?
- Did I preserve security middleware and input validation?
- Did I keep API responses consistent and typed?
- Did I run lint and build?
- Did I update markdown docs for behavior changes?
