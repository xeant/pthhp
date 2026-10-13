'use client'

import React from 'react'
import {motion} from 'framer-motion'

const Sectionbox = props => {
  return (
    <motion.div
      whileHover={{
        y: '1%',
        transition: {duration: 0.3},
      }}
      whileTap={{scale: 0.97, transition: {duration: 0.3}}}
    >
      <div className="rounded-2xl p-[0.5px] bg-gradient-to-tl from-dark-500/30 via-dark-700/40 to-dark-400/70 overflow-hidden">
        <div className="px-5 py-1 rounded-2xl bg-gradient-to-b from-dark-800/90 via-dark-950/75 to-dark-950/90">
          {props.children}
        </div>
      </div>
    </motion.div>
  )
}

export default Sectionbox
