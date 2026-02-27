export type RoleKey = "backend" | "designer" | "pm";

export type RoleInfo = {
  key: RoleKey;
  name: string;
  oneLiner: string;
  strengths: string[];
};

export type TrendMetric = {
  tool: string;
  adoptionRate: number;
  growthRate: number;
  demandIndex: number;
  difficulty: "낮음" | "중간" | "높음";
  communityScore?: number;
  activityScore?: number;
  stabilityScore?: number;
};

export type ScenarioInput = {
  id: string;
  role: RoleKey;
  teamSize: string;
  timeline: string;
  priority: string;
};

export type Recommendation = {
  label: "안정형" | "속도형" | "확장형";
  stack: string;
  fitScore: number;
  pros: string[];
  risks: string[];
};

export const roles: RoleInfo[] = [
  {
    key: "backend",
    name: "백엔드 개발자",
    oneLiner: "트래픽, 운영 안정성, 배포 속도 기준으로 선택",
    strengths: ["API", "DB", "인프라"],
  },
  {
    key: "designer",
    name: "디자이너",
    oneLiner: "협업 방식, 산출물 전달, 브랜딩 일관성 기준으로 선택",
    strengths: ["프로토타입", "디자인 시스템", "핸드오프"],
  },
  {
    key: "pm",
    name: "PM",
    oneLiner: "실험 속도, 리포팅 자동화, 팀 커뮤니케이션 기준으로 선택",
    strengths: ["실험", "요구사항", "우선순위"],
  },
];

export const trendData: Record<RoleKey, TrendMetric[]> = {
  backend: [
    { tool: "Node.js", adoptionRate: 44, growthRate: 7, demandIndex: 82, difficulty: "낮음" },
    { tool: "Spring Boot", adoptionRate: 31, growthRate: 4, demandIndex: 76, difficulty: "중간" },
    { tool: "Go", adoptionRate: 16, growthRate: 9, demandIndex: 68, difficulty: "중간" },
    { tool: "FastAPI", adoptionRate: 9, growthRate: 5, demandIndex: 54, difficulty: "낮음" },
    { tool: "NestJS", adoptionRate: 21, growthRate: 8, demandIndex: 66, difficulty: "낮음" },
    { tool: "Django", adoptionRate: 17, growthRate: 3, demandIndex: 59, difficulty: "중간" },
    { tool: "Rust (Axum)", adoptionRate: 6, growthRate: 10, demandIndex: 47, difficulty: "높음" },
    { tool: "Kotlin (Ktor)", adoptionRate: 5, growthRate: 6, demandIndex: 43, difficulty: "중간" },
  ],
  designer: [
    { tool: "Figma", adoptionRate: 72, growthRate: 6, demandIndex: 88, difficulty: "낮음" },
    { tool: "Framer", adoptionRate: 22, growthRate: 8, demandIndex: 57, difficulty: "중간" },
    { tool: "Adobe XD", adoptionRate: 12, growthRate: -3, demandIndex: 34, difficulty: "중간" },
    { tool: "Rive", adoptionRate: 8, growthRate: 4, demandIndex: 40, difficulty: "높음" },
    { tool: "Spline", adoptionRate: 7, growthRate: 7, demandIndex: 46, difficulty: "중간" },
    { tool: "ProtoPie", adoptionRate: 6, growthRate: 5, demandIndex: 44, difficulty: "중간" },
    { tool: "Lottie", adoptionRate: 11, growthRate: 3, demandIndex: 49, difficulty: "낮음" },
    { tool: "Storybook", adoptionRate: 14, growthRate: 6, demandIndex: 53, difficulty: "중간" },
  ],
  pm: [
    { tool: "Notion", adoptionRate: 58, growthRate: 5, demandIndex: 74, difficulty: "낮음" },
    { tool: "Jira", adoptionRate: 42, growthRate: 2, demandIndex: 69, difficulty: "중간" },
    { tool: "Linear", adoptionRate: 23, growthRate: 10, demandIndex: 61, difficulty: "낮음" },
    { tool: "Amplitude", adoptionRate: 11, growthRate: 3, demandIndex: 49, difficulty: "높음" },
    { tool: "Mixpanel", adoptionRate: 13, growthRate: 4, demandIndex: 52, difficulty: "중간" },
    { tool: "Asana", adoptionRate: 17, growthRate: 2, demandIndex: 54, difficulty: "낮음" },
    { tool: "ClickUp", adoptionRate: 9, growthRate: 5, demandIndex: 45, difficulty: "낮음" },
    { tool: "Miro", adoptionRate: 19, growthRate: 6, demandIndex: 58, difficulty: "낮음" },
  ],
};

export const scenarios: ScenarioInput[] = [
  { id: "be-mvp", role: "backend", teamSize: "1~3명", timeline: "2개월", priority: "빠른 출시" },
  { id: "be-scale", role: "backend", teamSize: "4~8명", timeline: "6개월+", priority: "확장성" },
  { id: "de-collab", role: "designer", teamSize: "2~6명", timeline: "지속", priority: "협업 효율" },
  { id: "de-brand", role: "designer", teamSize: "1~3명", timeline: "3개월", priority: "브랜딩" },
  { id: "pm-experiment", role: "pm", teamSize: "3~10명", timeline: "분기", priority: "실험 속도" },
  { id: "pm-report", role: "pm", teamSize: "5~15명", timeline: "지속", priority: "리포팅 자동화" },
];

export const recommendations: Record<RoleKey, Recommendation[]> = {
  backend: [
    {
      label: "안정형",
      stack: "Spring Boot + PostgreSQL + Redis",
      fitScore: 84,
      pros: ["대규모 운영 레퍼런스가 많음", "팀 온보딩 문서가 풍부"],
      risks: ["초기 개발 속도가 느릴 수 있음"],
    },
    {
      label: "속도형",
      stack: "NestJS + PostgreSQL",
      fitScore: 89,
      pros: ["1인 개발 속도가 빠름", "타입 기반 유지보수가 쉬움"],
      risks: ["고트래픽 구간에서 튜닝 필요"],
    },
    {
      label: "확장형",
      stack: "Go + PostgreSQL + Kafka",
      fitScore: 77,
      pros: ["성능과 확장성에 강함", "서비스 분리에 유리"],
      risks: ["학습 비용이 큼", "초기 구조 설계 부담"],
    },
  ],
  designer: [
    {
      label: "안정형",
      stack: "Figma + FigJam + Zeroheight",
      fitScore: 86,
      pros: ["협업 표준이 확실함", "디자인 시스템 운영에 유리"],
      risks: ["문서화가 누락되면 효율 저하"],
    },
    {
      label: "속도형",
      stack: "Figma + Framer",
      fitScore: 88,
      pros: ["프로토타입을 빠르게 배포", "비개발자도 실험 가능"],
      risks: ["프로덕션 전환 시 핸드오프 관리 필요"],
    },
    {
      label: "확장형",
      stack: "Figma + Rive + Storybook",
      fitScore: 75,
      pros: ["브랜드 경험 차별화", "모션 품질 개선"],
      risks: ["러닝커브와 관리 포인트 증가"],
    },
  ],
  pm: [
    {
      label: "안정형",
      stack: "Jira + Confluence + Slack",
      fitScore: 82,
      pros: ["역할 분리와 추적이 명확", "대규모 팀에 적합"],
      risks: ["설정 복잡도 높음"],
    },
    {
      label: "속도형",
      stack: "Linear + Notion + Slack",
      fitScore: 91,
      pros: ["실험과 의사결정 속도가 빠름", "UI가 가벼워 채택이 쉬움"],
      risks: ["복잡한 조직에는 제한적"],
    },
    {
      label: "확장형",
      stack: "Notion + Amplitude + Looker Studio",
      fitScore: 79,
      pros: ["리포팅 자동화와 인사이트 공유", "데이터 기반 우선순위 설정"],
      risks: ["데이터 모델 설계 필요"],
    },
  ],
};

export const insightCards = [
  {
    title: "이번 달 백엔드 키워드",
    body: "빠른 출시 구간에서 NestJS 채택이 증가했고, 고트래픽에서는 Go 관심도가 상승했습니다.",
  },
  {
    title: "디자이너 협업 변화",
    body: "디자인 시스템 문서화 도구 사용 비율이 올라가며 핸드오프 이슈가 줄어드는 추세입니다.",
  },
  {
    title: "PM 운영 패턴",
    body: "실험 중심 팀에서 Linear와 Notion 조합의 만족도가 높게 나타났습니다.",
  },
];

export const sourceNote = "샘플 데이터: 공개 리포트 구조를 모사한 MVP 예시 (표본 n=12,400, 업데이트 2026-02-26)";
