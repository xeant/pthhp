"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const FindHubPage = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    onscreen: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        duration: 0.4,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    onscreen: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="max-w-2xl mx-auto px-4"
      variants={containerVariants}
      initial="hidden"
      animate="onscreen"
    >
      <div className="text-center py-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-dark-50">
          계정 찾기
        </h2>
        <p className="mt-4 text-gray-500 dark:text-dark-400">
          찾으시려는 정보를 선택해주세요. <br />
          안전한 본인 인증을 통해 정보를 확인해 드립니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 아이디 찾기 카드 */}
        <Link href="/auth/find/findAccountId">
          <motion.div
            variants={itemVariants}
            className="group relative p-8 bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-2xl shadow-sm hover:shadow-md hover:border-gray-950 dark:hover:border-dark-300 transition-all cursor-pointer h-full flex flex-col items-center text-center"
          >
            <div className="mb-6 p-4 rounded-full bg-gray-50 dark:bg-dark-800 group-hover:bg-gray-950 group-hover:text-white dark:group-hover:bg-dark-200 dark:group-hover:text-dark-950 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-dark-50 mb-3">아이디 찾기</h3>
            <p className="text-sm text-gray-500 dark:text-dark-400 leading-relaxed">
              가입 시 등록한 정보로 <br /> 아이디를 확인합니다.
            </p>
            <div className="mt-6 text-sm font-medium text-gray-950 dark:text-dark-300 flex items-center gap-1 group-hover:gap-2 transition-all">
              진행하기 <span className="text-lg">→</span>
            </div>
          </motion.div>
        </Link>

        {/* 비밀번호 찾기 카드 */}
        <Link href="/auth/find/findPassword">
          <motion.div
            variants={itemVariants}
            className="group relative p-8 bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-2xl shadow-sm hover:shadow-md hover:border-gray-950 dark:hover:border-dark-300 transition-all cursor-pointer h-full flex flex-col items-center text-center"
          >
            <div className="mb-6 p-4 rounded-full bg-gray-50 dark:bg-dark-800 group-hover:bg-gray-950 group-hover:text-white dark:group-hover:bg-dark-200 dark:group-hover:text-dark-950 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-dark-50 mb-3">비밀번호 찾기</h3>
            <p className="text-sm text-gray-500 dark:text-dark-400 leading-relaxed">
              아이디를 알고 계신 경우 <br /> 비밀번호를 재설정합니다.
            </p>
            <div className="mt-6 text-sm font-medium text-gray-950 dark:text-dark-300 flex items-center gap-1 group-hover:gap-2 transition-all">
              진행하기 <span className="text-lg">→</span>
            </div>
          </motion.div>
        </Link>
      </div>

      <div className="my-12">
        <Link
          href="/auth/signin"
          className="text-sm text-gray-500 hover:text-gray-900 dark:text-dark-400 dark:hover:text-dark-200 transition-colors"
        >
          로그인 화면으로 돌아가기
        </Link>
      </div>
    </motion.div>
  );
};

export default FindHubPage;
