import Link from "next/link";
import { BarChart3, ChevronRight, Images, ReceiptText } from "lucide-react";
import { DefaultLayout } from "@extensions";

export const metadata = {
  title: "Tools",
};

const tools = [
  {
    href: "/tools/chart",
    title: "차트 생성기",
    description: "JSON 데이터와 옵션으로 막대 또는 원형 차트를 만들고 이미지로 저장합니다.",
    icon: BarChart3,
  },
  {
    href: "/tools/image-merge",
    title: "이미지 병합",
    description: "작업 사진을 최대 6장까지 한 장의 작업일지 이미지 또는 PDF로 만듭니다.",
    icon: Images,
  },
  {
    href: "/tools/cost-calculator",
    title: "공사비 계산기",
    description: "주말을 제외한 공사 기간과 기준 금액을 계산합니다.",
    icon: ReceiptText,
  },
];

export default function ToolsPage() {
  return (
    <DefaultLayout siteTitle="Plextype Tools">
      <section className="mx-auto w-full max-w-screen-xl px-4 py-10 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-primary-600">TOOLS</p>
          <h1 className="mt-3 text-3xl font-bold text-gray-950 dark:text-white">업무 도구</h1>
          <p className="mt-3 text-base leading-7 text-gray-600 dark:text-dark-300">기존 페이지에서 사용하던 도구를 Plextype 안에서 바로 실행할 수 있습니다.</p>
        </div>
        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.href} href={tool.href} className="group flex min-h-44 flex-col border border-gray-200 bg-white p-5 transition-colors hover:border-gray-400 dark:border-dark-700 dark:bg-dark-900 dark:hover:border-dark-500">
                <Icon className="h-6 w-6 text-primary-600" strokeWidth={1.8} />
                <h2 className="mt-5 text-lg font-semibold text-gray-950 dark:text-white">{tool.title}</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-dark-300">{tool.description}</p>
                <span className="mt-auto flex items-center gap-1 pt-5 text-sm font-medium text-gray-950 dark:text-white">
                  열기 <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </DefaultLayout>
  );
}
