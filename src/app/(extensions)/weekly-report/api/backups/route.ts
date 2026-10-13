import { NextResponse } from "next/server";
import type { WeeklyReportBackupPayload } from "@extensions/weekly-report/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const { listWeeklyReportBackupsQuery } = await import("@extensions/weekly-report/weekly-report.query");
  const backups = await listWeeklyReportBackupsQuery();
  return NextResponse.json({ backups });
}

export async function POST(request: Request) {
  const { saveWeeklyReportBackupQuery } = await import("@extensions/weekly-report/weekly-report.query");
  const body = await request.json();
  const payload = body.payload as WeeklyReportBackupPayload;
  const backup = await saveWeeklyReportBackupQuery(String(body.title || "업무보고 백업"), payload, body.id ? Number(body.id) : undefined);
  return NextResponse.json({ backup });
}
