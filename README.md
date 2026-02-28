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
- 상황추천 재방문 지원 (조건 스냅샷 저장/불러오기 + 직무별 마지막 선택 복원)
- 기술 비교 페이지 (직무 전환 + 다중 선택 비교)
- 트렌드 브리핑 페이지 (직무/기간/영향도 필터)
- 관심리스트 페이지 (로컬 저장 기반)
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
- 응답에는 추천안별 `reasons`(근거), `confidenceScore`/`trustLevel`(신뢰도), `whyNow`(지금 추천 이유), `tradeoff`(속도/안정성/확장성 점수)가 포함됩니다.
- `GET /api/trends/backend`
  - GitHub 공개 메타데이터(stars/commits/contributors) + npm/PyPI 보조 신호를 반영해 직무별 지표를 계산합니다.
  - 추가 지표: 활동성(activity), 커뮤니티(community), 안정성(stability), 신뢰도(confidence)
  - 일부 소스 실패 시 부분 fallback, 전체 실패 시 샘플 데이터 fallback
- `GET /api/briefings?role=backend&impact=high&periodDays=30`
  - 직무/영향도/기간 조건에 맞는 브리핑 카드 목록을 반환합니다.

## Main Routes

- `/` 홈
- `/roles` 직무 허브
- `/trends/[role]` 직무별 트렌드
- `/briefings` 트렌드 브리핑
- `/scenarios/[role]` 직무별 상황추천
- `/compare` 기술/도구 비교
- `/watchlist` 관심리스트
- `/insights` 월간 인사이트

## Security

- 기본 보안 헤더, 입력 검증, rate limit이 적용되어 있습니다.
- 자세한 내용은 `SECURITY.md`를 참고하세요.
