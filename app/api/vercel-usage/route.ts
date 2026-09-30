import { NextResponse } from "next/server";
import { getVercelUsageSummary } from "@/lib/vercel";

export async function GET() {
  const summary = await getVercelUsageSummary(30);
  return NextResponse.json(summary, { status: summary.ok ? 200 : 502 });
}
