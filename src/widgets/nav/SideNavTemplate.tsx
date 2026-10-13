'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Bell, ExternalLink, Home } from 'lucide-react'

import Accordion from '@components/accordion/Accordion'
import type { SiteNavigationItem } from '@/modules/admin/actions/_type'

const itemVariants = {
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

const menuLinkClass = (active: boolean) =>
  'flex items-center space-x-2 rounded-md px-2 py-2 lg:px-3 ' +
  (active
    ? 'bg-gray-950 text-white dark:bg-dark-950 dark:text-white'
    : 'text-gray-900 hover:bg-gray-200 hover:text-black dark:text-dark-400 dark:hover:bg-dark-950/80 dark:hover:text-white')

const childLinkClass = (active: boolean) =>
  'ml-6 flex items-center px-3 py-2 text-[0.752rem] transition-colors ' +
  (active
    ? 'font-medium text-gray-950 dark:text-dark-100'
    : 'text-gray-600 hover:text-black dark:text-dark-400 dark:hover:text-white')

const navLinkClass = (active: boolean) =>
  'flex items-center space-x-2 px-2 py-2 lg:px-3 ' +
  (active
    ? 'font-medium text-gray-950 dark:text-dark-100'
    : 'text-gray-900 hover:text-black dark:text-dark-400 dark:hover:text-white')

const SideNavTemplate = ({ navigationItems = [] }: { navigationItems?: SiteNavigationItem[] }) => {
  const pathname = usePathname()

  return (
    <>
      <motion.div className="px-3">
        <div>
          <motion.div className="mb-1 px-2 pb-2 pt-5 text-xs font-semibold text-gray-950/40 dark:text-white">
            Default
          </motion.div>
          <div className="space-y-1 pl-3">
            <motion.div variants={itemVariants}>
              <Link href="/" className={menuLinkClass(pathname === '/')}>
                <Home className="h-4 w-4" />
                <span className="text-[0.752rem] font-normal">Home</span>
              </Link>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Link href="/" className={menuLinkClass(false)}>
                <Bell className="h-4 w-4" />
                <span className="text-[0.752rem] font-normal">Notification</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <motion.div className="px-3">
        <div className="mb-1 px-2 pb-2 pt-5 text-xs font-semibold text-gray-950/40 dark:text-white">
          Nav
        </div>
        <motion.div className="mb-1 space-y-1 pl-3">
          {navigationItems.map((item) => {
            const children = item.children || []
            const isActive = pathname === item.href || children.some((child) => pathname === child.href)

            if (!children.length) {
              return (
                <motion.div variants={itemVariants} key={item.name}>
                  <Link
                    href={item.href}
                    target={item.target || undefined}
                    rel={item.target === '_blank' ? 'noreferrer' : undefined}
                    className={navLinkClass(pathname === item.href)}
                  >
                    <span className="text-[0.752rem] font-normal">{item.title}</span>
                  </Link>
                </motion.div>
              )
            }

            return (
              <motion.div variants={itemVariants} key={item.name}>
                <Accordion
                  variant="nav"
                  className="divide-y-0"
                  items={[
                    {
                      id: item.name,
                      title: (
                        <span className={navLinkClass(isActive)}>
                          <span className="text-[0.752rem] font-normal">{item.title}</span>
                        </span>
                      ),
                      isOpen: isActive,
                      content: (
                        <div className="space-y-1 pb-1">
                          {children.map((child) => (
                            <Link
                              key={child.name}
                              href={child.href}
                              target={child.target || undefined}
                              rel={child.target === '_blank' ? 'noreferrer' : undefined}
                              className={childLinkClass(pathname === child.href)}
                            >
                              {child.title}
                            </Link>
                          ))}
                        </div>
                      ),
                    },
                  ]}
                />
              </motion.div>
            )
          })}
        </motion.div>
      </motion.div>

      <motion.div className="px-3">
        <div>
          <motion.div className="mb-1 px-2 pb-2 pt-5 text-xs font-semibold text-gray-950/40 dark:text-white">
            Link
          </motion.div>
          <div className="space-y-1 pl-3">
            <motion.div variants={itemVariants}>
              <Link href="/" className={menuLinkClass(false)}>
                <Home className="h-4 w-4" />
                <span className="text-[0.752rem] font-normal">Forum</span>
              </Link>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Link href="/" className={menuLinkClass(false)}>
                <Bell className="h-4 w-4" />
                <span className="flex-1 text-[0.752rem] font-normal">Github</span>
                <ExternalLink className="h-3 w-3 text-gray-400" />
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default SideNavTemplate
