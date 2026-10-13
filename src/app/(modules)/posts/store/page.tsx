
import Link from "next/link";


import PostsCategories from "@/modules/posts/tpl/default/category";
import PageNavigation from "@components/nav/PageNavigation";
import { motion } from "framer-motion";
import React from "react";

const Page = async ({params, searchParams}: {params: Promise<{ pid: string }>;
  searchParams?: Promise<{ page?: string }>;}) => {
  console.log(params);

  const parentVariants = {
    onscreen: {
      transition: { staggerChildren: 0.2 },
    },
    offscreen: {
      transition: { staggerChildren: 0.2, staggerDirection: -1 },
    },
  };
  const variants = {
    onscreen: {
      y: 0,
      opacity: [0, 1],
      transition: {
        duration: 0.4,
      },
    },
    offscreen: {
      y: 25,
      opacity: 0,
    },
  };
  return (
    <>

      <div className="max-w-screen-xl mx-auto">
        <div className="relative">
          <div className="py-5 block-line">
            <PostsCategories/>
          </div>
        </div>
        <div className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
          <div className="col-span-1 py-4 p-3">
            <Link href="/src/app/(modules)/posts/store/22" className="group">
              <div className="relative overflow-hidden rounded-2xl">
                <div
                  className="h-[320px] bg-[url('/assets/images/bg39.jpg')] bg-cover bg-center transition duration-700 group-hover:scale-[1.08] rounded-2xl">
                  <div
                    className="absolute inset-0 bg-gradient-to-b from-gray-950/40 via-gray-950/30 to-gray-950/40 dark:from-dark-950/20 dark:via-dark-950/50 dark:to-dark-950/100"></div>
                </div>
              </div>
              <div className="px-1 py-6">
                <div className="mb-6 w-full">
                  <div
                    className="dark:text-dark-100 mb-3 line-clamp-2 text-2xl font-light text-gray-600 group-hover:text-black dark:group-hover:text-white">
                    Alien: River of Pain Revisions 2.0
                  </div>
                  <div
                    className="line-clamp-3 text-sm text-gray-400 group-hover:text-gray-600 dark:group-hover:text-white transition-all transform duration-700">
                    The birth of Rebecca Jorden, Known to her famliy as Newt, is
                    a cause for celebration. But as the colony grows and
                    expands, so, too, do the Political struggles between a small
                    be-tachment of Colonial Marines.
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="flex cursor-pointer items-center gap-2 py-1">
                    <div className="text-xs text-gray-950 dark:text-dark-200">
                      Web Design
                    </div>
                    <div className="text-xs text-gray-300 dark:text-dark-600">
                      |
                    </div>
                    <div className="text-xs text-gray-400 dark:text-dark-500">
                      1달전
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* <PostsList params={params} /> */}
      </div>
      <div className="relative mb-6">
        <div className="max-w-screen-xl mx-auto px-3">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 flex py-3">

            </div>
            <div className="flex items-center justify-end border-l border-gray-950/5 px-5">
              <Link
                href="/src/app/(modules)/posts/store/create"
                className="w-full flex text-sm py-3 px-12 rounded bg-gray-950 hover:bg-gray-900 text-white"
              >
                글쓰기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
