"use client";

import Link from "next/link";
import { ArrowLeft, Home, ShieldCheck, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const AuthLayout = ({
  children,
  siteUrl,
  siteTitle = "Plextype",
}: {
  children: React.ReactNode;
  siteUrl?: string;
  siteTitle?: string;
}) => {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 dark:bg-dark-950 dark:text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-gray-950 text-white lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_75%_70%,rgba(255,87,34,0.35),transparent_30%)]" />
          <div className="relative flex min-h-screen flex-col justify-between p-10">
            {siteUrl && (
              <Link href={siteUrl} className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-md bg-white text-sm font-bold text-gray-950">
                  {siteTitle.trim().charAt(0).toUpperCase() || "P"}
                </span>
                <span className="text-base font-semibold">{siteTitle}</span>
              </Link>
            )}

            <div className="max-w-xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/75 backdrop-blur">
                <Sparkles size={14} />
                Secure workspace
              </div>
              <h1 className="text-5xl font-semibold leading-tight tracking-normal">
                Build your project on a calm, extensible foundation.
              </h1>
              <p className="mt-6 text-base leading-7 text-white/60">
                회원 인증, 콘텐츠 관리, 확장 구조를 한 화면 흐름 안에서 안정적으로 연결합니다.
              </p>
            </div>

            <div className="grid gap-3 text-sm text-white/70">
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-primary-300" />
                Cookie based authentication
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-primary-300" />
                Role and permission ready
              </div>
            </div>
          </div>
        </section>

        <section className="flex min-h-screen flex-col">
          <header className="flex items-center justify-between px-4 py-4 sm:px-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm text-gray-500 transition-colors hover:bg-white hover:text-gray-950 dark:text-dark-300 dark:hover:bg-dark-900 dark:hover:text-white"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            {siteUrl && (
              <Link
                href={siteUrl}
                className="inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm text-gray-500 transition-colors hover:bg-white hover:text-gray-950 dark:text-dark-300 dark:hover:bg-dark-900 dark:hover:text-white"
              >
                <Home size={16} />
                Home
              </Link>
            )}
          </header>

          <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
            <div className="w-full max-w-md rounded-md border border-gray-200 bg-white p-6 shadow-sm shadow-gray-200/70 dark:border-dark-800 dark:bg-dark-900 dark:shadow-none">
              <div className="mb-8 lg:hidden">
                {siteUrl && (
                  <Link href={siteUrl} className="flex items-center gap-2">
                    <span className="grid h-9 w-9 place-items-center rounded-md bg-gray-950 text-xs font-bold text-white dark:bg-white dark:text-gray-950">
                      {siteTitle.trim().charAt(0).toUpperCase() || "P"}
                    </span>
                    <span className="text-sm font-semibold">{siteTitle}</span>
                  </Link>
                )}
              </div>
              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default AuthLayout;
