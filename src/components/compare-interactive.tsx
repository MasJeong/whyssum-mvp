"use client";

import { useMemo, useState } from "react";
import ProgressBar from "@/components/progress-bar";
import { roles, trendData, type RoleKey } from "@/lib/mvp-data";

type CompareItem = {
  name: string;
  adoption: number;
  growth: number;
  difficulty: number;
  complexity: number;
  cost: number;
};

const difficultyMap: Record<"낮음" | "중간" | "높음", number> = {
  낮음: 32,
  중간: 56,
  높음: 74,
};

function toCompareItems(role: RoleKey): CompareItem[] {
  return trendData[role].map((item) => {
    const difficulty = difficultyMap[item.difficulty];
    const complexity = Math.round(Math.min(90, difficulty * 0.65 + item.demandIndex * 0.35));
    const cost = Math.round(Math.min(90, 95 - item.adoptionRate + complexity * 0.25));

    return {
      name: item.tool,
      adoption: item.adoptionRate,
      growth: item.growthRate,
      difficulty,
      complexity,
      cost,
    };
  });
}

const defaultSelectedByRole: Record<RoleKey, string[]> = {
  backend: ["Node.js", "Spring Boot", "Go"],
  designer: ["Figma", "Framer", "Rive"],
  pm: ["Notion", "Jira", "Linear"],
};

export default function CompareInteractive() {
  const [role, setRole] = useState<RoleKey>("backend");
  const [selected, setSelected] = useState<Set<string>>(new Set(defaultSelectedByRole.backend));

  const compareItems = useMemo(() => toCompareItems(role), [role]);

  const switchRole = (nextRole: RoleKey) => {
    setRole(nextRole);
    setSelected(new Set(defaultSelectedByRole[nextRole]));
  };

  const selectedItems = useMemo(
    () => compareItems.filter((item) => selected.has(item.name)),
    [compareItems, selected],
  );

  const toggleSelection = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        if (next.size === 1) {
          return prev;
        }
        next.delete(name);
        return next;
      }

      if (next.size >= 4) {
        return prev;
      }

      next.add(name);
      return next;
    });
  };

  return (
    <>
      <section className="card">
        <div className="role-switch">
          {roles.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`role-pill ${item.key === role ? "role-pill-active" : ""}`}
              onClick={() => switchRole(item.key)}
            >
              {item.name}
            </button>
          ))}
        </div>
        <h2>비교할 기술 선택 (최대 4개)</h2>
        <div className="checkbox-grid">
          {compareItems.map((item) => {
            const checked = selected.has(item.name);
            return (
              <label key={item.name} className={`check-card ${checked ? "check-card-on" : ""}`}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleSelection(item.name)}
                  aria-label={`${item.name} 비교 선택`}
                />
                <span>{item.name}</span>
                <small>채택 {item.adoption}%</small>
              </label>
            );
          })}
        </div>
        <p className="inline-note" style={{ marginTop: "0.6rem" }}>
          현재 비교 기준: {roles.find((item) => item.key === role)?.name}
        </p>
      </section>

      <section className="card">
        <h2>비교 결과</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>기술</th>
                <th>채택률</th>
                <th>성장률</th>
                <th>러닝커브</th>
                <th>운영복잡도</th>
                <th>비용부담</th>
              </tr>
            </thead>
            <tbody>
              {selectedItems.map((item) => (
                <tr key={item.name}>
                  <td>{item.name}</td>
                  <td>{item.adoption}%</td>
                  <td>+{item.growth}%</td>
                  <td>
                    <ProgressBar value={item.difficulty} />
                  </td>
                  <td>
                    <ProgressBar value={item.complexity} />
                  </td>
                  <td>
                    <ProgressBar value={item.cost} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
