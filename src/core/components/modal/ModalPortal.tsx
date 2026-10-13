import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  children: React.ReactNode
}

const ModalPortal = ({ children }: Props) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // 1. 서버 사이드거나 아직 마운트되지 않았다면 아무것도 렌더링하지 않음
  if (typeof window === 'undefined' || !mounted) return null

  // 2. 엘리먼트를 찾음
  const element = document.getElementById('modal')

  // 3. 엘리먼트가 없을 경우에 대한 예외 처리 (TypeScript 에러 해결 지점)
  if (!element) {
    console.error("ID가 'modal'인 엘리먼트를 찾을 수 없습니다. _document.tsx나 index.html을 확인하세요.")
    return null
  }

  return createPortal(children, element)
}

export default ModalPortal