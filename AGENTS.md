# AGENTS.md
Agent guide for this repository.
Scope: whole repository.

## 1) Working Contract
- This file is the default operating guide for coding agents.
- Instruction precedence: user request > system/developer constraints > this file.
- Verify behavior against real files/scripts before acting.
- Keep changes focused, minimal, and consistent with existing patterns.

## 2) Project Snapshot
- App: `whyssum`
- Stack: Next.js `^16.1.6` (App Router), React `19.0.0`, TypeScript, Tailwind CSS 4, Zod
- Lint: ESLint 9 using flat config (`eslint.config.mjs`)
- Runtime: Node.js 20+
- Package manager: npm
- Main branch: `main`

## 3) Important Paths
- App routes: `src/app/`
- API handlers: `src/app/api/**/route.ts`
- Shared libs: `src/lib/`
- Components: `src/components/`
- Global styles/tokens: `src/app/globals.css`
- Security notes: `SECURITY.md`
- Review docs: `review_docs/`

## 4) Cursor / Copilot Rule Files
Checked and currently absent:
- `.cursorrules`
- `.cursor/rules/`
- `.github/copilot-instructions.md`
If added later, follow them and update this document.

## 5) Setup and Run Commands
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

## 6) Test Commands and Single-Test Policy
Current state:
- No test runner is configured in `package.json`.
- No single-test command exists in this repository.

Single-test guidance:
- Do not invent `npm test` or framework-specific test commands.
- If tests are introduced later, add exact single-test commands here.

Required validation before marking work complete:
```bash
npm run lint
npm run build
```

## 7) Code Style Guidelines
### Language and types
- TypeScript is strict (`tsconfig.json` has `strict: true`).
- Prefer explicit, narrow types over broad types.
- Avoid `any`, `@ts-ignore`, and `@ts-expect-error` unless explicitly requested.
- Keep API request/response types close to route logic when practical.

### Imports
- Use `@/*` alias imports for internal modules.
- Import order:
  1. framework/external
  2. internal alias imports
  3. type-only imports (`import type`)
- Remove unused imports.

### Naming
- Components: PascalCase (`ScenarioExplorer`, `WatchlistView`).
- Variables/functions: camelCase.
- Constants: UPPER_SNAKE_CASE for true constants only.
- Route segment params should follow existing naming patterns (`role`).

### Formatting and layout
- Follow existing ESLint/Next style and the surrounding file style.
- No Prettier config is present; do not assume Prettier formatting.
- Keep JSX readable; split large sections into smaller components.
- Prefer existing classes/tokens from `globals.css` before new styles.
- Keep inline styles minimal and intentional.
- For detail/expanded UI, prioritize usability: summary first, details on demand, and avoid dense information walls.
- When adding explanatory content, optimize for fast scanning (clear headings, short bullets, low cognitive load).

### React / Next.js conventions
- Default to Server Components in `src/app/`.
- Use `"use client"` only when interactivity/browser APIs are required.
- Keep API routes under `src/app/api/**/route.ts`.
- For dynamic routes, follow this repo's typed Promise params pattern.

### Error handling and API behavior
- Validate external input with Zod.
- Return structured JSON errors with appropriate status codes.
- Keep user-facing errors safe and generic.
- Never leak stack traces in API responses.
- Preserve rate-limit headers where relevant.

### Security and data resilience
- Treat all input (query/body/params) as untrusted.
- Keep middleware security behavior intact unless explicitly requested.
- Preserve fallback behavior for external API failures.
- If scoring/API contracts change, update docs in the same change set.

## 8) Documentation Update Rules
When behavior, metrics, API contracts, or UX flow changes:
1. Update `README.md` if public usage/API changed.
2. Update relevant files in `review_docs/`:
   - `changed-files.md`
   - `cautions.md`
   - `requirements.md`
   - `backend-review-guide.md` (if backend behavior changed)
Documentation should be updated in the same change set.

## 9) Git Workflow Expectations
- Work on `main` unless instructed otherwise.
- Keep commits focused and descriptive.
- Do not rewrite published history unless explicitly requested.
- Before commit/push, ensure lint and build pass.

## 10) Quick Agent Checklist
- Did I use only real commands from `package.json`?
- Did I avoid non-existent test commands?
- Did I keep type safety (no broad `any` or suppression shortcuts)?
- Did I preserve validation, security, and error response consistency?
- Did I run `npm run lint` and `npm run build`?
- Did I update `README.md` and `review_docs/` for behavior changes?
