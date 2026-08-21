'use client'

import { motion } from 'framer-motion'
import SideNavTemplate from '@widgets/nav/SideNavTemplate'
import type { SiteNavigationItem } from '@/modules/admin/actions/_type'

const SideNav = ({ navigationItems = [] }: { navigationItems?: SiteNavigationItem[] }) => {
  const parentVariants = {
    onscreen: {
      transition: { staggerChildren: 0.1 },
    },
    offscreen: {
      transition: { staggerChildren: 0.1, staggerDirection: -1 },
    },
  }

  return (
    <>
      <div className="relative h-full overflow-hidden">
        <motion.div
          variants={parentVariants}
          initial="offscreen"
          whileInView="onscreen"
          // initial={{ opacity: 0, x: "-50%" }}
          className="overflow-scroll-hide dark:bg-dark-900/80 absolute bottom-0 top-0 h-full w-[275px] overflow-y-auto bg-white/90 pb-[80px]"
        >
          <SideNavTemplate navigationItems={navigationItems} />
        </motion.div>
      </div>
    </>
  )
}
export default SideNav
