/**
 * @file NotFound.js
 * @author 지제이웍스 (gjworks2@gmail.com)
 * @brief 404 페이지를 찾을 수 없을 경우
 **/

import React from 'react'
import Link from 'next/link'

const NotFound = () => {
  return (
    <div className="w-full h-full py-20 text-sm selection:text-black selection:bg-rose-500">
      <div className="max-w-md mx-auto px-3">
        <div className="pb-10">
          <span className="font-bold text-6xl text-rose-600">4</span>
          <span className="font-bold text-6xl text-white">0</span>
          <span className="font-bold text-6xl text-rose-600">4</span>
        </div>
        <div className="text-white text-xl mb-5">Oops, Sorry.</div>
        <div className="text-dark-400 mb-10">
          해당 경로에서 현재 페이지를 찾을 수 없습니다.<br></br> 뒤로가기를
          누르시거나{' '}
          <Link
            href="https://gjworks.dev"
            className="text-rose-500 hover:underline"
          >
            메인 페이지
          </Link>
          로 이동 후 정확한 경로로 접속하시기 바랍니다.
        </div>
        <div className="flex items-center mb-10">
          <div className="text-dark-300 mr-2">Page is Not Found.</div>
          <div>
            <Link
              href="https://gjworks.dev"
              className="flex items-center text-white bg-dark-600 hover:bg-dark-500 text-xs rounded-full py-2 px-5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span>Homepage</span>
            </Link>
          </div>
        </div>

        <div className="flex mb-10">
          <Link
            href="https://github.com/gjworks"
            target="_blank"
            rel="noopener noreferrer"
            className="text-dark-400 hover:text-rose-500 hover:underline pr-4"
          >
            Github
          </Link>
          <Link
            href="https://twitter.com/Gjworks2"
            target="_blank"
            rel="noopener noreferrer"
            className="text-dark-400 hover:text-rose-500 hover:underline pr-4"
          >
            Twitter
          </Link>
          <Link
            href="https://www.facebook.com/gjworks2"
            target="_blank"
            rel="noopener noreferrer"
            className="text-dark-400 hover:text-rose-500 hover:underline pr-4"
          >
            Facebook
          </Link>
          <Link
            href="https://medium.com/@gjworks"
            target="_blank"
            rel="noopener noreferrer"
            className="text-dark-400 hover:text-rose-500 hover:underline pr-4"
          >
            Medium
          </Link>
        </div>
        <div>
          <Link
            href="mailto:gjworks2@gmail.com"
            className="flex items-center text-dark-400 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span>gjworks2@gmail.com</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
