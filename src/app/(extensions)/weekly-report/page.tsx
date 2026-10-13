import { DefaultLayout } from "@extensions";
import WeeklyReportTool from "./WeeklyReportTool";

export const metadata = {
  title: "업무보고",
};

export default function WeeklyReportPage() {
  return (
    <DefaultLayout>
      <WeeklyReportTool />
    </DefaultLayout>
  );
}
