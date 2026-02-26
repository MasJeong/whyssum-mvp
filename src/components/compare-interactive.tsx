"use client";

import { useMemo, useState } from "react";
import ProgressBar from "@/components/progress-bar";

type CompareItem = {
  name: string;
  adoption: number;
  growth: number;
  difficulty: number;
  complexity: number;
  cost: number;
};

const compareItems: CompareItem[] = [
  { name: "Node.js", adoption: 44, growth: 7, difficulty: 35, complexity: 46, cost: 41 },
  { name: "Spring Boot", adoption: 31, growth: 4, difficulty: 58, complexity: 63, cost: 54 },
  { name: "Go", adoption: 16, growth: 9, difficulty: 62, complexity: 55, cost: 38 },
  { name: "FastAPI", adoption: 9, growth: 5, difficulty: 32, complexity: 28, cost: 26 },
  { name: "NestJS", adoption: 24, growth: 8, difficulty: 37, complexity: 44, cost: 33 },
];

const defaultSelected = new Set(["Node.js", "Spring Boot", "Go"]);

export default function CompareInteractive() {
  const [selected, setSelected] = useState<Set<string>>(defaultSelected);

  const selectedItems = useMemo(
    () => compareItems.filter((item) => selected.has(item.name)),
    [selected],
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
