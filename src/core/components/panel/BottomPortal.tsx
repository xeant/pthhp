'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const BottomPortal = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || typeof window === 'undefined') return null

  const element = document.getElementById('bottom')

  // element가 null인지 명확히 체크해줍니다.
  if (!element) return null

  return createPortal(children, element)
}

export default BottomPortal