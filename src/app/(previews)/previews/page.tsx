import Link from "next/link";

const previewItems = [
  {
    href: "/previews/page/home",
    title: "Home Page",
    description: "src/core/registry/defaultHomePage.tsx",
  },
  {
    href: "/previews/layouts/default",
    title: "Default Layout",
    description: "src/layouts/default/Layout.tsx",
  },
  {
    href: "/previews/layouts/auth",
    title: "Auth Layout",
    description: "src/layouts/auth/Layout.tsx",
  },
];

const PreviewsPage = () => {
  return (
    <main className="min-h-screen bg-white dark:bg-dark-950">
      <div className="mx-auto max-w-screen-xl px-3 py-12">
        <div className="mb-8">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Core Preview</div>
          <h1 className="mt-3 text-2xl font-semibold text-gray-950 dark:text-white">기본 제공 화면</h1>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {previewItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md border border-gray-200 bg-white p-5 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-dark-800 dark:bg-dark-900 dark:hover:bg-dark-800"
            >
              <div className="text-sm font-semibold text-gray-950 dark:text-white">{item.title}</div>
              <div className="mt-2 text-xs text-gray-400">{item.description}</div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
};

export default PreviewsPage;
