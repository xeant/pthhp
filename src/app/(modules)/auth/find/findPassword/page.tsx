"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { requestPasswordResetAction } from "@/modules/user/actions/recovery.action";

const FindPasswordPage = () => {
  const [phase, setPhase] = useState<"input" | "sent">("input");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});
    setMessage("");

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await requestPasswordResetAction(formData);

      if (result.success) {
        setMessage(result.message);
        setPhase("sent");
        return;
      }

      setMessage(result.message);
      setFieldErrors(result.fieldErrors || {});
    });
  };

  const variants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  };

  const inputContainerClass =
    "group flex w-full items-center rounded-md border border-gray-200 bg-white shadow-md shadow-gray-100 transition-all duration-200 " +
    "hover:border-gray-400 focus-within:border-gray-400 focus-within:ring-4 focus-within:ring-gray-200/75 " +
    "dark:border-dark-700 dark:bg-dark-900 dark:shadow-none dark:hover:border-dark-500 dark:focus-within:border-dark-500 dark:focus-within:ring-dark-800";

  return (
    <div className="max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {phase === "input" ? (
          <motion.div key="input" variants={variants} initial="hidden" animate="visible" exit="exit">
            <div className="text-center py-10">
              <div className="mb-4 flex justify-center text-gray-700 dark:text-dark-50">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-dark-50">비밀번호 찾기</h2>
              <p className="text-gray-500 dark:text-dark-400 text-sm mt-3">
                가입하신 아이디 또는 이메일을 입력하시면 <br />
                비밀번호 재설정 안내를 보내드립니다.
              </p>
            </div>

            <form onSubmit={submitHandler} className="space-y-6">
              <div>
                <label htmlFor="account" className="block text-sm text-black dark:text-dark-200 mb-2 font-medium">아이디 또는 이메일</label>
                <div className={inputContainerClass}>
                  <div className="pl-3 pr-2 text-gray-400 transition-colors group-focus-within:text-gray-800 dark:text-dark-500 dark:group-focus-within:text-dark-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="account"
                    id="account"
                    required
                    className="w-full bg-transparent py-2.5 pr-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 dark:text-dark-100 dark:placeholder:text-dark-500"
                    placeholder="아이디 또는 이메일을 입력하세요"
                  />
                </div>
                {fieldErrors.account && <p className="mt-2 text-xs font-medium text-red-500">{fieldErrors.account}</p>}
              </div>

              {message && phase === "input" && <p className="text-sm text-red-500">{message}</p>}

              <button
                disabled={isPending}
                className="w-full bg-gray-900 dark:bg-dark-100 text-white dark:text-dark-950 py-3 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-dark-200 transition-all flex justify-center items-center disabled:opacity-60"
              >
                {isPending ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white dark:border-dark-950/30 dark:border-t-dark-950 rounded-full animate-spin"></span>
                ) : (
                  "재설정 링크 받기"
                )}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div key="sent" variants={variants} initial="hidden" animate="visible" exit="exit" className="text-center py-10">
            <div className="mb-6 flex justify-center text-cyan-600">
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <div className="absolute -right-1 -bottom-1 bg-white dark:bg-dark-950 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-cyan-600">
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.74-5.24z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-dark-50">메일이 발송되었습니다</h2>
            <div className="mt-8 p-6 bg-gray-50 dark:bg-dark-900 rounded-lg border border-gray-100 dark:border-dark-800">
              <p className="text-sm leading-6 text-gray-600 dark:text-dark-400">{message}</p>
              <p className="text-xs text-gray-400 mt-4">
                메일이 오지 않았다면 스팸 메일함을 확인해주세요.
              </p>
            </div>

            <div className="mt-8 space-y-3">
              <Link href="/auth/signin" className="block w-full bg-gray-900 dark:bg-primary-700 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                로그인 화면으로 이동
              </Link>
              <button onClick={() => setPhase("input")} className="block w-full text-gray-500 hover:text-gray-800 dark:hover:text-dark-200 text-sm underline">
                다시 시도
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default FindPasswordPage;
