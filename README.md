# 직무핑 (JikmuPing)

직무별 기술 트렌드를 한눈에 보여주는 데이터 리포트 웹 서비스 MVP 프로젝트입니다.

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS 4
- ESLint 9

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

## Security

- 기본 보안 헤더, 입력 검증, rate limit이 적용되어 있습니다.
- 자세한 내용은 `SECURITY.md`를 참고하세요.
