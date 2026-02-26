import { NextResponse } from "next/server";
import { getRoleTrendMetrics } from "@/lib/live-role-trends";
import { type RoleKey } from "@/lib/mvp-data";

type Params = {
  params: Promise<{ role: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { role } = await params;
  const roleKey = role as RoleKey;

  if (!(["backend", "designer", "pm"] as string[]).includes(roleKey)) {
    return NextResponse.json({ error: "지원하지 않는 role입니다." }, { status: 400 });
  }

  const result = await getRoleTrendMetrics(roleKey);
  return NextResponse.json({ role: roleKey, ...result });
}
