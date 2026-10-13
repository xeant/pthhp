import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { getWeeklyReportBackupQuery } = await import("@extensions/weekly-report/weekly-report.query");
  const { id } = await params;
  const backup = await getWeeklyReportBackupQuery(Number(id));
  if (!backup) return NextResponse.json({ message: "백업을 찾을 수 없습니다." }, { status: 404 });
  return NextResponse.json({ backup });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { deleteWeeklyReportBackupQuery } = await import("@extensions/weekly-report/weekly-report.query");
  const { id } = await params;
  const deleted = await deleteWeeklyReportBackupQuery(Number(id));
  if (!deleted) return NextResponse.json({ message: "백업을 찾을 수 없습니다." }, { status: 404 });
  return NextResponse.json({ deleted: true });
}
