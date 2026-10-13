export type WeeklyReportBackupPayload = {
  version: number;
  department: string;
  startDate: string;
  endDate: string;
  writtenDate: string;
  rows: Array<{
    date: string;
    place: string;
    detail: string;
    note: string;
    noteMode?: "auto" | "manual";
  }>;
  photoDays: Array<{
    date: string;
    photos: string[];
  }>;
  savedAt?: string;
};

export type WeeklyReportBackupSummary = {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
};
