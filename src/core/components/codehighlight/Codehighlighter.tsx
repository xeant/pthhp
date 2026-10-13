'use client'

import React, { useEffect } from 'react'
import Prism from 'prismjs'

import 'prismjs/components/prism-typescript.min'
import 'prismjs/components/prism-jsx.min'
import 'prismjs/components/prism-tsx.min'
import 'prismjs/components/prism-java.min'
import 'prismjs/components/prism-bash.min'
import 'prismjs/components/prism-css.min'
import 'prismjs/components/prism-docker.min'
import 'prismjs/components/prism-git.min'
import 'prismjs/components/prism-graphql.min'
import 'prismjs/components/prism-javascript.min'
import 'prismjs/components/prism-json.min'
import 'prismjs/components/prism-markdown.min'
import 'prismjs/components/prism-markup.min'
import 'prismjs/components/prism-sql.min'
import 'prismjs/components/prism-swift.min'
import 'prismjs/components/prism-yaml.min'

const Codehighlighter = props => {
  useEffect(() => {
    Prism.highlightAll()
  }, [])
  return (
    <>
      <div className="Code bg-white/75 dark:bg-dark-950/80 rounded-md overflow-hidden border border-gray-200 dark:border-dark-800 dark:border-t-dark-700 shadow-md shadow-gray-200/70 dark:shadow-dark-950 backdrop-blur-lg w-full">
        <div className="grid grid-cols-12 gap-6 border-b border-gray-200 dark:border-dark-800 bg-gray-50 dark:bg-dark-900">
          <div className="col-span-2 flex gap-2 items-center py-2.5 pl-4">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
          </div>
          <div className="col-span-8 ">
            <div className="flex items-center justify-center text-xs text-center text-gray-900 dark:text-white h-full">
              {props.title}
            </div>
          </div>
          <div className="col-span-2 text-xs">
            <div className="flex justify-end h-full ">
              <div className="h-full flex items-center justify-center text-[10px] border-l border-gray-200 bg-gray-100 dark:bg-dark-900 dark:border-dark-700 dark:hover:bg-dark-800 px-4 py-1 text-gray-400 hover:text-gray-600 dark:text-dark-500 dark:hover:text-dark-400 cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <pre>
          <code className={`language-${props.lang}`}>{props.value}</code>
        </pre>
      </div>
    </>
  )
}

export default Codehighlighter
