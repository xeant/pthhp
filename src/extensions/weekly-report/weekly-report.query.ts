import prisma from "@/core/utils/db/prisma";
import type { WeeklyReportBackupPayload, WeeklyReportBackupSummary } from "./types";

let schemaPromise: Promise<void> | null = null;

export const ensureWeeklyReportSchemaQuery = async () => {
  if (!schemaPromise) {
    schemaPromise = prisma
      .$executeRawUnsafe(
        `CREATE TABLE IF NOT EXISTS "WeeklyReportBackup" ("id" SERIAL PRIMARY KEY, "title" VARCHAR(160) NOT NULL, "payload" JSONB NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(), "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW())`,
      )
      .then(() => undefined)
      .catch((error) => {
        schemaPromise = null;
        throw error;
      });
  }
  await schemaPromise;
};

const toSummary = (row: any): WeeklyReportBackupSummary => ({
  id: Number(row.id),
  title: String(row.title || "업무보고 백업"),
  createdAt: new Date(row.createdAt).toISOString(),
  updatedAt: new Date(row.updatedAt).toISOString(),
});

export const listWeeklyReportBackupsQuery = async (): Promise<WeeklyReportBackupSummary[]> => {
  await ensureWeeklyReportSchemaQuery();
  const rows = await prisma.$queryRaw<any[]>`SELECT "id", "title", "createdAt", "updatedAt" FROM "WeeklyReportBackup" ORDER BY "updatedAt" DESC, "id" DESC`;
  return rows.map(toSummary);
};

export const getWeeklyReportBackupQuery = async (id: number) => {
  await ensureWeeklyReportSchemaQuery();
  const rows = await prisma.$queryRaw<any[]>`SELECT "id", "title", "payload", "createdAt", "updatedAt" FROM "WeeklyReportBackup" WHERE "id" = ${id} LIMIT 1`;
  const row = rows[0];
  if (!row) return null;
  return { ...toSummary(row), payload: row.payload as WeeklyReportBackupPayload };
};

export const saveWeeklyReportBackupQuery = async (title: string, payload: WeeklyReportBackupPayload, id?: number) => {
  await ensureWeeklyReportSchemaQuery();
  const serializedPayload = JSON.stringify(payload);
  const rows = id
    ? await prisma.$queryRaw<any[]>`UPDATE "WeeklyReportBackup" SET "title" = ${title}, "payload" = ${serializedPayload}::jsonb, "updatedAt" = NOW() WHERE "id" = ${id} RETURNING "id", "title", "createdAt", "updatedAt"`
    : await prisma.$queryRaw<any[]>`INSERT INTO "WeeklyReportBackup" ("title", "payload") VALUES (${title}, ${serializedPayload}::jsonb) RETURNING "id", "title", "createdAt", "updatedAt"`;
  if (!rows[0]) throw new Error("백업 대상을 찾을 수 없습니다.");
  return toSummary(rows[0]);
};

export const deleteWeeklyReportBackupQuery = async (id: number) => {
  await ensureWeeklyReportSchemaQuery();
  const result = await prisma.$executeRaw`DELETE FROM "WeeklyReportBackup" WHERE "id" = ${id}`;
  return Number(result) > 0;
};
