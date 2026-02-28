import Link from "next/link";
import { notFound } from "next/navigation";
import ScenarioExplorer from "@/components/scenario-explorer";
import { roles, scenarios, type RoleKey } from "@/lib/mvp-data";

type PageProps = {
  params: Promise<{ role: string }>;
};

/**
 * 직무별 상황추천 페이지를 렌더링한다.
 * @param params 동적 라우트 파라미터
 * @returns 상황추천 페이지 UI
 */
export default async function ScenarioPage({ params }: PageProps) {
  const { role } = await params;
  const roleKey = role as RoleKey;
  const roleInfo = roles.find((item) => item.key === roleKey);

  if (!roleInfo) {
    notFound();
  }

  const roleScenarios = scenarios.filter((item) => item.role === roleKey);
  return (
    <main className="container page">
      <section className="card">
        <p className="eyebrow">상황추천</p>
        <h1>{roleInfo.name}</h1>
        <p className="muted readable">같은 직무라도 팀 크기와 일정, 우선순위에 따라 추천안이 달라집니다.</p>
        <div className="role-switch mt-md">
          {roles.map((item) => (
            <Link
              key={item.key}
              href={`/scenarios/${item.key}`}
              className={`role-pill ${item.key === roleKey ? "role-pill-active" : ""}`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>자주 찾는 상황</h2>
        <div className="chip-row">
          {roleScenarios.map((item) => (
            <span className="chip" key={item.id}>
              {item.teamSize} · {item.timeline} · {item.priority}
            </span>
          ))}
        </div>
      </section>

      <ScenarioExplorer role={roleKey} />

      <section className="card split-note">
        <div>
          <h2>선택이 애매하면?</h2>
          <p className="muted readable">비교 화면에서 러닝커브, 운영복잡도, 비용 부담을 한 번에 보세요.</p>
        </div>
        <Link href="/compare" className="button button-primary">
          추천안 비교하기
        </Link>
      </section>
    </main>
  );
}
