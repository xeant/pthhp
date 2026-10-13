import { DefaultLayout } from "@extensions";
import CostCalculatorTool from "@extensions/tools/CostCalculatorTool";

export const metadata = {
  title: "Cost calculator",
};

export default function CostCalculatorToolPage() {
  return (
    <DefaultLayout>
      <CostCalculatorTool />
    </DefaultLayout>
  );
}
