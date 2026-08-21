"use client";
import { motion } from "framer-motion";
import Link from "next/link";

const SearchForm = () => {
  return (
    <>
      <div className=" ">
        <div className="dark:border-dark-700 flex border-b border-gray-200 p-3">
          <input
            type="text"
            className="dark:text-dark-200 dark:placeholder:text-dark-500 group flex-1 bg-transparent px-3 py-2 text-base text-gray-600 outline-none placeholder:font-light placeholder:text-gray-500 focus:text-black"
            placeholder="Search Text..."
          ></input>
          <button className="dark:text-dark-300 text-gray-700 hover:text-gray-900 group-focus:text-white dark:hover:text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </button>
        </div>
        <motion.div
          className="px-5 pb-4 pt-3"
          initial={{ opacity: 0, y: "20%" }}
          animate={{
            opacity: 1,
            y: "0%",
            transition: { duration: 0.8, delay: 0.5 },
          }}
        >
          <div className="flex items-center gap-4">
            <div className="dark:text-dark-400 text-xs text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M5.25 2.25a3 3 0 00-3 3v4.318a3 3 0 00.879 2.121l9.58 9.581c.92.92 2.39 1.186 3.548.428a18.849 18.849 0 005.441-5.44c.758-1.16.492-2.629-.428-3.548l-9.58-9.581a3 3 0 00-2.122-.879H5.25zM6.375 7.5a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="dark:bg-primary-500 dark:hover:bg-primary-400 flex cursor-pointer rounded-full bg-gray-950 px-3 py-1 text-xs text-white hover:bg-gray-950 hover:text-white dark:text-white dark:hover:text-white">
              <div className="px-2">React</div>
              <div className="pl-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <div className="dark:bg-primary-500 dark:hover:bg-primary-400 flex cursor-pointer rounded-full bg-gray-300 px-3 py-1 text-xs text-gray-700 hover:bg-gray-950 hover:text-white dark:text-white dark:hover:text-white">
              <div className="px-2">Framer Motion</div>
              <div className="pl-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>
        <motion.div
          className="px-5 pb-5 pt-2"
          initial={{ opacity: 0, y: "20%" }}
          animate={{
            opacity: 1,
            y: "0%",
            transition: { duration: 0.9, delay: 0.3 },
          }}
        >
          <div className="mb-3 text-sm font-semibold text-black dark:text-white">
            검색기록
          </div>
          <div className="dark:border-dark-700 dark:text-dark-500 flex cursor-pointer rounded-sm border-b border-gray-300/50 px-3 py-3 text-sm text-gray-600 hover:bg-gray-950 hover:text-white dark:hover:bg-primary-500 dark:hover:text-white">
            <div className="flex-1">tailwind 설정하는 방법</div>
            <div>22.05.23</div>
          </div>
          <div className="dark:border-dark-700 dark:text-dark-500 flex cursor-pointer rounded-sm border-b border-gray-300/50 px-3 py-3 text-sm text-gray-600 hover:bg-gray-950 hover:text-white dark:hover:bg-primary-500 dark:hover:text-white">
            <div className="flex-1">Prisma Create Schemas</div>
            <div>22.05.23</div>
          </div>
          <div className="dark:text-dark-500 flex cursor-pointer rounded-sm px-3 py-3 text-sm text-gray-600 hover:bg-gray-950 hover:text-white dark:hover:bg-primary-500 dark:hover:text-white">
            <div className="flex-1">postfix 메일 설정</div>
            <div>22.05.23</div>
          </div>
        </motion.div>
      </div>

      <div className="px-3 pt-2">
        <motion.div
          className="px-3 pb-5 pt-2"
          initial={{ opacity: 0, y: "20%" }}
          animate={{
            opacity: 1,
            y: "0%",
            transition: { duration: 1.1, delay: 0.5 },
          }}
        >
          <div className="flex">
            <div className="dark:text-dark-400 dark:hover:text-dark-50 text-gray-500 hover:text-gray-800">
              <Link href="">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                  />
                </svg>
              </Link>
            </div>
            <div className="flex-1"></div>
            <div className="dark:text-dark-500 text-xs text-gray-400">
              Cookie 정책보기
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default SearchForm;
