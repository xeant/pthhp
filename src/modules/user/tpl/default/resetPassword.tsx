"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { KeyRound, LockKeyhole, CheckCircle2 } from "lucide-react";
import { resetPasswordAction } from "@/modules/user/actions/recovery.action";

const inputContainerClass =
  "group flex w-full items-center rounded-md border border-gray-200 bg-white shadow-md shadow-gray-100 transition-all duration-200 " +
  "hover:border-gray-400 focus-within:border-gray-400 focus-within:ring-4 focus-within:ring-gray-200/75 " +
  "dark:border-dark-700 dark:bg-dark-900 dark:shadow-none dark:hover:border-dark-500 dark:focus-within:border-dark-300 dark:focus-within:ring-dark-700";

const ResetPasswordPage = ({ token }: { token: string }) => {
  const [isDone, setIsDone] = useState(false);
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    formData.set("token", token);

    startTransition(async () => {
      const result = await resetPasswordAction(formData);

      setMessage(result.message);
      setFieldErrors(result.fieldErrors || {});
      if (result.success) setIsDone(true);
    });
  };

  if (!token) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-dark-900 dark:text-dark-300">
          <LockKeyhole size={24} />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-dark-50">재설정 링크가 올바르지 않습니다</h2>
        <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-dark-400">비밀번호 재설정을 다시 요청해주세요.</p>
        <Link href="/auth/find/findPassword" className="mt-8 inline-flex rounded-lg bg-gray-900 px-5 py-3 text-sm font-bold text-white dark:bg-dark-100 dark:text-dark-950">
          재설정 다시 요청
        </Link>
      </div>
    );
  }

  if (isDone) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
          <CheckCircle2 size={26} />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-dark-50">비밀번호 변경 완료</h2>
        <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-dark-400">{message}</p>
        <Link href="/auth/signin" className="mt-8 inline-flex rounded-lg bg-gray-900 px-5 py-3 text-sm font-bold text-white dark:bg-dark-100 dark:text-dark-950">
          로그인 화면으로 이동
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-700 dark:bg-dark-900 dark:text-dark-100">
          <KeyRound size={24} />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-dark-50">새 비밀번호 설정</h2>
        <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-dark-400">
          계정 보호를 위해 기존 비밀번호와 다른 새 비밀번호를 입력해주세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 space-y-5">
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-black dark:text-dark-200">새 비밀번호</label>
          <div className={inputContainerClass}>
            <div className="pl-3 pr-2 text-gray-400 transition-colors group-focus-within:text-gray-800 dark:group-focus-within:text-dark-200">
              <LockKeyhole size={18} />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full bg-transparent py-2.5 pr-3 text-sm outline-none dark:text-white placeholder:text-gray-400"
              placeholder="새 비밀번호를 입력해주세요"
            />
          </div>
          {fieldErrors.password && <p className="mt-2 text-xs font-medium text-red-500">{fieldErrors.password}</p>}
        </div>

        <div>
          <label htmlFor="passwordConfirm" className="mb-2 block text-sm font-medium text-black dark:text-dark-200">새 비밀번호 확인</label>
          <div className={inputContainerClass}>
            <div className="pl-3 pr-2 text-gray-400 transition-colors group-focus-within:text-gray-800 dark:group-focus-within:text-dark-200">
              <LockKeyhole size={18} />
            </div>
            <input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              required
              className="w-full bg-transparent py-2.5 pr-3 text-sm outline-none dark:text-white placeholder:text-gray-400"
              placeholder="새 비밀번호를 한 번 더 입력해주세요"
            />
          </div>
          {fieldErrors.passwordConfirm && <p className="mt-2 text-xs font-medium text-red-500">{fieldErrors.passwordConfirm}</p>}
        </div>

        {message && <p className="text-sm text-red-500">{message}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center rounded-lg bg-gray-900 py-3 text-sm font-bold text-white transition-colors hover:bg-gray-800 disabled:opacity-60 dark:bg-dark-100 dark:text-dark-950 dark:hover:bg-dark-200"
        >
          {isPending ? "변경 중..." : "비밀번호 변경"}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
