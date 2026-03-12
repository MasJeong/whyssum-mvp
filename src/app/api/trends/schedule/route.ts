import { NextResponse } from "next/server";
import { refreshAllRoleTrendMetrics, type RefreshRoleResult } from "@/lib/live-role-trends";
import { appendTrendScheduleHistory, notifyTrendSchedule, readTrendScheduleHistory, type TrendScheduleAlertStatus } from "@/lib/trend-schedule-store";

type ScheduleState = {
  lastRunAt: string | null;
  lastDurationMs: number | null;
  lastSuccess: boolean | null;
  lastResults: RefreshRoleResult[];
  lastAlertStatus: TrendScheduleAlertStatus | null;
};

const scheduleState: ScheduleState = {
  lastRunAt: null,
  lastDurationMs: null,
  lastSuccess: null,
  lastResults: [],
  lastAlertStatus: null,
};

/**
 * 스케줄 보호용 비밀키가 유효한지 검증한다.
 * @param request 요청 객체
 * @returns 유효하면 true, 아니면 false
 */
function validateCronSecret(request: Request): boolean {
  const required = process.env.TRENDS_CRON_SECRET?.trim();
  if (!required) {
    return true;
  }

  const url = new URL(request.url);
  const byQuery = url.searchParams.get("secret")?.trim();
  const byHeader = request.headers.get("x-cron-secret")?.trim();
  return byQuery === required || byHeader === required;
}

/**
 * 최근 스케줄 실행 상태를 반환한다.
 * @returns 상태 응답
 */
export async function GET() {
  const { history, persistenceMode } = await readTrendScheduleHistory();
  return NextResponse.json({
    status: "ok",
    ...scheduleState,
    history,
    persistenceMode,
  });
}

/**
 * 전체 직무 트렌드 지표를 강제 갱신한다.
 * @param request 요청 객체
 * @returns 실행 결과 응답
 */
export async function POST(request: Request) {
  if (!validateCronSecret(request)) {
    return NextResponse.json({ error: "유효하지 않은 스케줄 키입니다." }, { status: 401 });
  }

  const startedAt = Date.now();

  try {
    const results = await refreshAllRoleTrendMetrics();
    const duration = Date.now() - startedAt;
    const nowIso = new Date().toISOString();
    const alertStatus = await notifyTrendSchedule({
      runAt: nowIso,
      durationMs: duration,
      success: true,
      results,
      alertStatus: "skipped",
    });
    const { history, persistenceMode } = await appendTrendScheduleHistory({
      runAt: nowIso,
      durationMs: duration,
      success: true,
      results,
      alertStatus,
    });

    scheduleState.lastRunAt = nowIso;
    scheduleState.lastDurationMs = duration;
    scheduleState.lastSuccess = true;
    scheduleState.lastResults = results;
    scheduleState.lastAlertStatus = alertStatus;

    return NextResponse.json({
      status: "ok",
      runAt: nowIso,
      durationMs: duration,
      alertStatus,
      persistenceMode,
      history,
      results,
    });
  } catch {
    const duration = Date.now() - startedAt;
    const nowIso = new Date().toISOString();
    const alertStatus = await notifyTrendSchedule({
      runAt: nowIso,
      durationMs: duration,
      success: false,
      results: [],
      alertStatus: "skipped",
    });
    const { history, persistenceMode } = await appendTrendScheduleHistory({
      runAt: nowIso,
      durationMs: duration,
      success: false,
      results: [],
      alertStatus,
    });

    scheduleState.lastRunAt = nowIso;
    scheduleState.lastDurationMs = duration;
    scheduleState.lastSuccess = false;
    scheduleState.lastResults = [];
    scheduleState.lastAlertStatus = alertStatus;

    return NextResponse.json(
      {
        status: "error",
        runAt: nowIso,
        durationMs: duration,
        alertStatus,
        persistenceMode,
        history,
        error: "트렌드 스케줄 갱신에 실패했습니다.",
      },
      { status: 500 },
    );
  }
}
