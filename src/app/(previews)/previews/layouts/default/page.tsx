import DefaultLayout from "@/layouts/default/Layout";

const DefaultLayoutPreviewPage = () => {
  return (
    <DefaultLayout siteTitle="Plextype Preview" siteUrl="/previews">
      <section className="px-3 py-16">
        <div className="mx-auto max-w-screen-md">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Default Layout</div>
          <h1 className="mt-3 text-3xl font-semibold text-gray-950 dark:text-white">기본 레이아웃 미리보기</h1>
          <p className="mt-4 text-sm leading-6 text-gray-500 dark:text-dark-300">
            코어가 제공하는 기본 헤더, 본문 영역, 푸터 구조입니다.
          </p>
        </div>
      </section>
    </DefaultLayout>
  );
};

export default DefaultLayoutPreviewPage;
