import Link from "next/link";

const NotFound = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-20 text-gray-950 dark:bg-dark-950 dark:text-white">
      <div className="w-full max-w-md text-center">
        <div className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          404
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-normal">
          페이지를 찾을 수 없습니다.
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-dark-300">
          주소가 바뀌었거나 존재하지 않는 페이지입니다. 홈으로 이동한 뒤 다시 접근해주세요.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-md bg-gray-950 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-950"
          >
            홈으로 이동
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
