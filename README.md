# 왜씀? (whyssum)

"요즘 왜 이걸 쓰는지"를 직무별로 빠르게 확인하는 멀티 직무 의사결정 MVP입니다.

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- ESLint 9

## MVP Scope

- 직무 허브: 백엔드, 디자이너, PM
- 직무별 트렌드 페이지
- 상황추천 페이지 (필터 기반 재계산 + 안정형/속도형/확장형)
- 기술 비교 페이지 (직무 전환 + 다중 선택 비교)
- 월간 인사이트 페이지

## Getting Started

먼저 Node.js 20+ 환경에서 의존성을 설치하세요.

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

## Available Scripts

- `npm run dev` - 개발 서버 실행
- `npm run build` - 프로덕션 빌드
- `npm run start` - 프로덕션 서버 실행
- `npm run lint` - 린트 실행

## API Example

- `GET /api/recommendations?role=backend&teamSize=1~3명&timeline=2개월&priority=빠른 출시`
- 입력 파라미터는 서버에서 검증되며, 기본 rate limit이 적용됩니다.
- `GET /api/trends/backend`
  - GitHub 공개 메타데이터(stars) + 최근 30일 커밋 활동 기반으로 직무별 지표를 계산합니다.
  - 외부 API 실패 시 샘플 데이터로 fallback 합니다.

## Main Routes

- `/` 홈
- `/roles` 직무 허브
- `/trends/[role]` 직무별 트렌드
- `/scenarios/[role]` 직무별 상황추천
- `/compare` 기술/도구 비교
- `/insights` 월간 인사이트

## Security

- 기본 보안 헤더, 입력 검증, rate limit이 적용되어 있습니다.
- 자세한 내용은 `SECURITY.md`를 참고하세요.
