'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import nav from '@/core/res/config/navigation.json'

const SideNavTemplate = props => {
  const pathname = usePathname()
  const variants = {
    onscreen: {
      x: 0,
      opacity: [0, 1],
      transition: {
        duration: 0.4,
      },
    },
    offscreen: {
      x: -25,
      opacity: 0,
    },
  }
  return (
    <>
      <motion.div className="px-3">
        <div className="mb-1 px-2 pb-2 pt-5 text-xs font-semibold text-gray-950/40 dark:text-white">
          Nav
        </div>
        <motion.div className="mb-1 space-y-1">
          {nav.header &&
            Object.entries(nav.header).map((data, index) => {
              return (
                <motion.div variants={variants} key={data[1].name}>
                  <Link
                    href={data[1].route}
                    className={
                      'flex items-center space-x-2 rounded-md px-2 py-2 lg:px-3 ' +
                      (pathname === data[1].route
                        ? 'bg-gray-950 text-white dark:text-white'
                        : 'dark:text-dark-400 text-gray-900 hover:bg-gray-200 hover:text-black dark:hover:text-white')
                    }
                  >
                    <span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M15.988 3.012A2.25 2.25 0 0 1 18 5.25v6.5A2.25 2.25 0 0 1 15.75 14H13.5V7A2.5 2.5 0 0 0 11 4.5H8.128a2.252 2.252 0 0 1 1.884-1.488A2.25 2.25 0 0 1 12.25 1h1.5a2.25 2.25 0 0 1 2.238 2.012ZM11.5 3.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v.25h-3v-.25Z"
                          clipRule="evenodd"
                        />
                        <path
                          fillRule="evenodd"
                          d="M2 7a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7Zm2 3.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Zm0 3.5a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                    <span className="text-sm font-normal">{data[1].title}</span>
                  </Link>
                </motion.div>
              )
            })}
        </motion.div>
      </motion.div>
    </>
  )
}
export default SideNavTemplate
