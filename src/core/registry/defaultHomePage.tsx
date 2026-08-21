import Link from "next/link";

const DefaultHomePage = () => {
  return (
    <section className="mx-auto max-w-screen-xl px-3 py-20">
      <div className="max-w-2xl">
        <div className="mb-4 text-sm font-medium text-primary-500">Plextype</div>
        <h1 className="text-4xl font-semibold tracking-normal text-gray-950 dark:text-white">
          Extensible content platform
        </h1>
        <p className="mt-5 text-sm leading-6 text-gray-500 dark:text-dark-300">
          기본 코어는 안정적으로 유지하고, 프로젝트별 화면과 기능은 extensions에서 자유롭게 확장합니다.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/posts/notice"
            className="rounded-md bg-gray-950 px-4 py-2 text-sm text-white hover:bg-gray-800 dark:bg-white dark:text-gray-950"
          >
            게시판 보기
          </Link>
          <Link
            href="/admin"
            className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:border-gray-300 hover:text-gray-950 dark:border-dark-700 dark:text-dark-300 dark:hover:text-white"
          >
            관리자
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DefaultHomePage;
