"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, LogIn, RefreshCw } from "lucide-react";

export default function UserError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("User route error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-screen-sm items-center justify-center px-3 py-16">
      <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm shadow-gray-100">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
          <AlertTriangle size={22} />
        </div>
        <h1 className="mt-5 text-lg font-bold text-gray-950">페이지를 불러오지 못했습니다.</h1>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          로그인 세션이 만료되었거나 일시적인 오류가 발생했습니다. 다시 시도하거나 로그인 후 이용해 주세요.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-900 hover:text-white"
          >
            <RefreshCw size={14} />
            다시 시도
          </button>
          <Link
            href="/auth/signin"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gray-950 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-gray-700"
          >
            <LogIn size={14} />
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}
