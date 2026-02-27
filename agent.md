# agent.md (한국어 안내)

이 문서는 이 저장소에서 작업하는 에이전트를 위한 한국어 운영 가이드입니다.
영문 기준 문서는 `AGENTS.md`입니다.

## 프로젝트 개요

- 프로젝트명: `whyssum`
- 스택: Next.js 16(App Router), React 19, TypeScript, Tailwind CSS 4, ESLint 9, Zod
- 패키지 매니저: npm
- 기본 브랜치: `main`

## 주요 경로

- 라우트: `src/app/`
- API: `src/app/api/`
- 공통 로직: `src/lib/`
- 컴포넌트: `src/components/`
- 보안 문서: `SECURITY.md`
- 검토 문서: `review_docs/`

## Cursor/Copilot 규칙 파일 확인 결과

- `.cursorrules` 없음
- `.cursor/rules/` 없음
- `.github/copilot-instructions.md` 없음

추후 생성되면 이 문서와 `AGENTS.md`를 같이 업데이트하세요.

## 필수 명령어

의존성 설치:

```bash
npm install
```

개발 서버 실행:

```bash
npm run dev
```

프로덕션 빌드:

```bash
npm run build
```

프로덕션 실행:

```bash
npm run start
```

린트:

```bash
npm run lint
```

## 테스트 관련

- 현재 `package.json`에 `test` 스크립트가 없습니다.
- 따라서 최소 검증 기준은 아래 2개입니다.

```bash
npm run lint
npm run build
```

- 단일 테스트 실행 명령은 테스트 프레임워크가 도입되면 추가합니다.

## 코드 작성 규칙

### 타입/언어

- TypeScript strict 모드 유지 (`strict: true`).
- `any` 사용 지양, 가능한 좁은 타입 사용.
- `@ts-ignore`, `@ts-expect-error`는 원칙적으로 사용 금지.

### import

- 내부 모듈은 `@/*` alias 사용 (`@/lib/...`, `@/components/...`).
- import 순서 권장:
  1. 프레임워크/외부 패키지
  2. 내부 alias 모듈
  3. 타입 import

### 네이밍

- 컴포넌트: PascalCase
- 함수/변수: camelCase
- 상수: UPPER_SNAKE_CASE
- 라우트 파라미터: 기존 관례 유지(`role`)

### React/Next 규칙

- 기본은 Server Component 사용.
- 상호작용 필요 시에만 `"use client"` 추가.
- API는 `src/app/api/**/route.ts` 패턴 유지.

### 에러 처리

- API는 상태코드와 JSON 에러 메시지 일관 유지.
- 내부 상세/스택트레이스는 응답에 노출 금지.
- rate-limit 헤더 유지.

### 보안

- `middleware.ts` 보안 헤더 유지.
- 입력값은 Zod로 검증.
- 외부 API 실패 시 fallback 경로 유지.

## 데이터/지표 관련 규칙

- 실데이터 트렌드 로직: `src/lib/live-role-trends.ts`
- fallback 데이터: `src/lib/mvp-data.ts`
- 지표/계산식 변경 시 문서 동기화 필수
  - `README.md`
  - `review_docs/changed-files.md`
  - `review_docs/cautions.md`
  - `review_docs/requirements.md`
  - (백엔드 영향 시) `review_docs/backend-review-guide.md`

## Git 작업 규칙

- 기본 작업 브랜치: `main`
- 커밋 전 필수 확인:
  - `npm run lint`
  - `npm run build`
- 원격 반영된 이력은 임의로 rewrite하지 않음(요청 시에만).

## 빠른 체크리스트

- 타입 안정성을 해치지 않았는가?
- API 검증/에러/보안 헤더를 유지했는가?
- UI 변경 시 모바일 레이아웃을 확인했는가?
- 동작 변경 시 md 문서를 함께 업데이트했는가?
- lint/build를 통과했는가?
