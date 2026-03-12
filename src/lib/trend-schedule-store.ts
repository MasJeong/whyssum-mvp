import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { RefreshRoleResult } from "@/lib/live-role-trends";

export type TrendScheduleAlertStatus = "sent" | "skipped" | "failed";
export type TrendSchedulePersistenceMode = "file" | "memory";

export type TrendScheduleRunRecord = {
  runAt: string;
  durationMs: number;
  success: boolean;
  results: RefreshRoleResult[];
  alertStatus: TrendScheduleAlertStatus;
};

const HISTORY_LIMIT = 20;
const historyFilePath = path.join(process.cwd(), ".sisyphus", "runtime", "trend-schedule-history.json");
const memoryHistory: TrendScheduleRunRecord[] = [];

/**
 * 이력 배열을 최근 N건만 유지하도록 자른다.
 * @param items 정리할 이력 배열
 * @returns 최신순 최대 N건 이력
 */
function trimHistory(items: TrendScheduleRunRecord[]) {
  return items.slice(0, HISTORY_LIMIT);
}

/**
 * 파일 저장소에 남아 있는 스케줄 이력을 읽는다.
 * @returns 파일 저장 이력 또는 null
 */
async function readFileHistory() {
  try {
    const raw = await readFile(historyFilePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed.filter((item): item is TrendScheduleRunRecord => typeof item === "object" && item !== null);
  } catch {
    return null;
  }
}

/**
 * 스케줄 이력을 파일 저장소에 기록한다.
 * @param items 저장할 이력 배열
 * @returns 저장 성공 여부
 */
async function writeFileHistory(items: TrendScheduleRunRecord[]) {
  try {
    await mkdir(path.dirname(historyFilePath), { recursive: true });
    await writeFile(historyFilePath, JSON.stringify(trimHistory(items), null, 2), "utf8");
    return true;
  } catch {
    return false;
  }
}

/**
 * 최근 스케줄 실행 이력을 조회한다.
 * @returns 이력 목록과 저장 모드
 */
export async function readTrendScheduleHistory() {
  const fileHistory = await readFileHistory();
  if (fileHistory) {
    return {
      history: trimHistory(fileHistory),
      persistenceMode: "file" as TrendSchedulePersistenceMode,
    };
  }

  return {
    history: trimHistory(memoryHistory),
    persistenceMode: "memory" as TrendSchedulePersistenceMode,
  };
}

/**
 * 최근 스케줄 실행 이력에 새 기록을 추가한다.
 * @param record 추가할 실행 기록
 * @returns 저장 후 이력 목록과 저장 모드
 */
export async function appendTrendScheduleHistory(record: TrendScheduleRunRecord) {
  const current = await readTrendScheduleHistory();
  const nextHistory = trimHistory([record, ...current.history]);
  memoryHistory.splice(0, memoryHistory.length, ...nextHistory);

  const savedToFile = await writeFileHistory(nextHistory);
  return {
    history: nextHistory,
    persistenceMode: savedToFile ? ("file" as TrendSchedulePersistenceMode) : ("memory" as TrendSchedulePersistenceMode),
  };
}

/**
 * 스케줄 실행 결과를 운영 알림 웹훅으로 전송할지 판단한다.
 * @param record 실행 기록
 * @returns 전송 필요 여부
 */
function shouldNotify(record: TrendScheduleRunRecord) {
  if (!record.success) return true;
  return record.results.some((item) => item.mode === "fallback");
}

/**
 * 스케줄 실행 결과를 운영 알림 웹훅으로 전송한다.
 * @param record 실행 기록
 * @returns 알림 전송 상태
 */
export async function notifyTrendSchedule(record: TrendScheduleRunRecord): Promise<TrendScheduleAlertStatus> {
  const webhookUrl = process.env.TRENDS_ALERT_WEBHOOK_URL?.trim();
  if (!webhookUrl || !shouldNotify(record)) {
    return "skipped";
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        kind: "trend_schedule_alert",
        runAt: record.runAt,
        durationMs: record.durationMs,
        success: record.success,
        fallbackRoles: record.results.filter((item) => item.mode === "fallback").map((item) => item.role),
      }),
    });
    return response.ok ? "sent" : "failed";
  } catch {
    return "failed";
  }
}
