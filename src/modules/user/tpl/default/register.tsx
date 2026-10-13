"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import InputField from "@components/form/InputField";
import Button from "@components/button/Button";

const Register = () => {
  const [loading, setLoading] = useState(false); // ✅ 로딩 상태 추가
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null);
  const router = useRouter();

  const refAccountId = useRef<HTMLInputElement>(null);
  const refEmail = useRef<HTMLInputElement>(null);
  const refPassword = useRef<HTMLInputElement>(null);
  const refNickName = useRef<HTMLInputElement>(null);

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormMessage(null);
    setFieldErrors(null);
    setLoading(true); // ✅ 통신 시작 시 true

    const formData = new FormData(e.currentTarget);

    try {
      // ... (fetch 로직 생략)
      const response = await fetch("/api/user", {
        method: "POST",
        body: formData,
        credentials: "include", // 쿠키 포함
      });
      const res = await response.json();
      if (res.type === "error") {
        const errors = res.fieldErrors || res.data || null;

        if (errors && typeof errors === "object") {
          setFieldErrors(errors);

          if (errors.accountId) refAccountId.current?.focus();
          else if (errors.email || errors.email_address) refEmail.current?.focus();
          else if (errors.password) refPassword.current?.focus();
          else if (errors.nickName) refNickName.current?.focus();
        } else {
          setFormMessage(res.message || "회원가입에 실패했습니다.");
        }
      } else if (res.type === "success") {
        router.replace("/auth/signin");
      }
    } catch (err) {
      setFormMessage("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false); // ✅ 통신 종료(성공/실패 모두) 시 false
    }

  };

  const variants = {
    hidden: { opacity: 0, x: 44 },
    onscreen: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
        delayChildren: 0.1,
        staggerChildren: 0.1,
      },
    },
    offscreen: {
      x: 44,
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  // 🎨 아이콘 상수 정의 (JSX 가독성을 위해)
  const UserIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );

  const MailIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  );

  const LockIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  );

  const NicknameIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
    </svg>
  );

  const inputContainerClass =
    "group flex w-full items-center rounded-md border border-gray-200 bg-white shadow-md shadow-gray-100 transition-all duration-200 " +
    "hover:border-gray-300 focus-within:border-gray-300 focus-within:ring-4 focus-within:ring-gray-200/75 " +
    "dark:border-dark-700 dark:bg-dark-900 dark:hover:border-dark-500 dark:focus-within:border-dark-300 dark:focus-within:ring-dark-300";

  return (
    <motion.div
      className=""
      variants={variants}
      initial="hidden"
      animate="onscreen"
      exit="offscreen"
    >
      <motion.div className="flex justify-center py-10" variants={variants}>
        <div>
          <div className="mb-4 flex justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
              className="w-10 h-10 text-black dark:text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75"
              />
            </svg>
          </div>

          <div className="text-2xl text-dark-800 dark:text-dark-50 text-center">
            Register
          </div>
          <div className="text-dark-600 text-sm pt-5 text-center">
            회원가입을 해주셔서 감사드립니다.
          </div>
          <div className="text-dark-600 text-sm text-center">
            회원님의 정보는 안전하게 저장되어 보관됩니다.
          </div>
        </div>
      </motion.div>
      {formMessage && (
        <div className="mb-5 rounded-md bg-red-50 px-3 py-2 text-sm leading-6 text-red-500">
          {formMessage}
        </div>
      )}
      <form onSubmit={submitHandler}>
        {/* Account ID Input */}
        <div className="mb-5">
          <InputField
            inputTitle="Account ID"
            name="accountId"
            placeholder="사용하실 아이디를 입력하세요"
            icon={UserIcon}
            ref={refAccountId}
            error={fieldErrors?.accountId}
          />

        </div>
        <div className="mb-5">
          {/* Email Address */}
          <InputField
            inputTitle="Email Address"
            name="email"
            type="email"
            placeholder="example@mail.com"
            icon={MailIcon}
            ref={refEmail}
            error={fieldErrors?.email || fieldErrors?.email_address}
          />
        </div>

        {/* Password */}
        <div className="mb-5">
          <InputField
            inputTitle="Password"
            name="password"
            type="password"
            placeholder="비밀번호를 입력하세요"
            icon={LockIcon}
            ref={refPassword}
            error={fieldErrors?.password}
          />
          <p className="text-xs text-gray-500 dark:text-dark-400 mt-2 ml-1">
            * 비밀번호는 영문, 숫자, 특수문자 1개 이상(@, $, !, %, *, #, ?, &)을 모두 포함해야 합니다.
          </p>
        </div>

        {/* Nickname */}
        <div className="mb-6">
          <InputField
            inputTitle="Nick Name"
            name="nickName"
            placeholder="사용하실 닉네임을 입력하세요"
            icon={NicknameIcon}
            ref={refNickName}
            error={fieldErrors?.nickName}
          />
          <p className="text-xs text-gray-500 dark:text-dark-400 mt-2 ml-1">
            * 닉네임은 최소 2~12자까지 가능하며 특수문자는 사용할 수 없습니다.
          </p>
        </div>

        {/* Submit Button */}
        <div className="mb-2">
          <Button isLoading={loading} fullWidth={true} type="submit" className="py-3">
            Register Completed
          </Button>
        </div>
      </form>
      <motion.div className="divider" variants={variants}>
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-dark-600 to-transparent"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="backdrop-blur-sm px-4 text-xs text-dark-400 bg-white dark:bg-dark-950">
              OR
            </span>
          </div>
        </div>
      </motion.div>
      <motion.div className="pb-10" variants={variants}>
        <div className="w-full">
          <div className="w-full">
            <Link href="/auth/signin" className="group text-sm text-dark-500">
              계정이 이미 있으시다면{" "}
              <span className="group-hover:text-gray-500 text-gray-600 dark:group-hover:text-dark-400 dark:text-dark-200 underline">
                Sign In
              </span>
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Register;
