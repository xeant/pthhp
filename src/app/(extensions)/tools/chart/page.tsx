import { DefaultLayout } from "@extensions";
import ChartTool from "@extensions/tools/ChartTool";

export const metadata = {
  title: "Chart",
};

export default function ChartToolPage() {
  return (
    <DefaultLayout>
      <ChartTool />
    </DefaultLayout>
  );
}
