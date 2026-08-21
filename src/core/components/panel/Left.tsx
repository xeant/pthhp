'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LeftPortal from '@/core/components/panel/LeftPortal'

const Left = ({ state, close, children, width }) => {
  const [panelState, setPanelState] = useState(false)
  useEffect(() => {
    setPanelState(state)
  }, [state])
  // useEffect(() => {
  //   if (panelState === true) {
  //     const $body = document.querySelector('body')
  //     const overflow = $body.style.overflow
  //     $body.style.overflow = 'hidden'
  //     return () => {
  //       $body.style.overflow = overflow
  //     }
  //   }
  // }, [panelState])

  useEffect(() => {
    if (panelState === true) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [panelState])

  const variants = {
    openPanel: {
      marginRight: 0,
      transition: { duration: 0.3 },
    },
    closePanel: {
      marginRight: '100%',
      transition: { duration: 0.3 },
    },
  }
  const exit = {
    marginRight: '100%',
    transition: { duration: 0.3 },
  }
  const handleClosePanel = () => {
    close(false)
  }
  return (
    <>
      <AnimatePresence>
        {state && (
          <LeftPortal>
            <motion.div className="bg-transition z-90 fixed inset-0 transform overflow-auto">
              <div
                className="z-99 absolute inset-0 dark:bg-dark-800/20 bg-gray-800/20"
                onClick={handleClosePanel}
              ></div>
              <motion.div
                initial={{ width: '275px', marginLeft: '-275px' }}
                animate={{
                  width: '275px',
                  marginLeft: 0,
                  transition: { duration: 0.3 },
                }}
                exit={{
                  width: '275px',
                  marginLeft: '-275px',
                  transition: { duration: 0.3 },
                }}
                className="z-100 dark:bg-dark-100/10 fixed h-screen overflow-hidden overflow-y-auto bg-white/50 text-gray-900 shadow-lg shadow-gray-900/25 backdrop-blur-md dark:text-white dark:shadow-gray-900 dark:backdrop-blur-md"
              >
                {children}
              </motion.div>
            </motion.div>
          </LeftPortal>
        )}
      </AnimatePresence>
    </>
  )
}
export default Left
