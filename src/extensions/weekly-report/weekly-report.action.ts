"use server";

import type { WeeklyReportBackupPayload } from "./types";
import {
  deleteWeeklyReportBackupQuery,
  getWeeklyReportBackupQuery,
  listWeeklyReportBackupsQuery,
  saveWeeklyReportBackupQuery,
} from "./weekly-report.query";

const normalizePayload = (payload: WeeklyReportBackupPayload): WeeklyReportBackupPayload => ({
  version: Number(payload.version || 1),
  department: String(payload.department || ""),
  startDate: String(payload.startDate || ""),
  endDate: String(payload.endDate || ""),
  writtenDate: String(payload.writtenDate || ""),
  rows: Array.isArray(payload.rows) ? payload.rows : [],
  photoDays: Array.isArray(payload.photoDays) ? payload.photoDays : [],
  savedAt: new Date().toISOString(),
});

export const listWeeklyReportBackupsAction = async () => listWeeklyReportBackupsQuery();

export const getWeeklyReportBackupAction = async (id: number) => getWeeklyReportBackupQuery(id);

export const saveWeeklyReportBackupAction = async (input: { id?: number; title: string; payload: WeeklyReportBackupPayload }) => {
  const title = input.title.trim() || "업무보고 백업";
  return saveWeeklyReportBackupQuery(title, normalizePayload(input.payload), input.id);
};

export const deleteWeeklyReportBackupAction = async (id: number) => deleteWeeklyReportBackupQuery(id);
