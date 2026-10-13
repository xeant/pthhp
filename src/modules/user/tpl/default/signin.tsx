'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ActionResponse } from '@/core/types/actions'
import { useRouter } from 'next/navigation'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { QrCode, RefreshCw, Smartphone } from 'lucide-react'

import InputField from '@components/form/InputField'
import Button from '@components/button/Button'
import { useToastStore } from '@/core/store/useToastStore'

interface SignData {
  type: string
  element: string
  message: string
  userInfo: {
    id: number
    uuid: string
    accountId: string
    nickName: string
    password: string
    email_address: string
    createdAt: string
    updateAt: string
  }
}

const Signin = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const addToast = useToastStore(state => state.addToast)
  // const dispatch = store.dispatch;

  const [user, setUser] = useState<SignData>()
  const [formMessage, setFormMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null)

  useEffect(() => {
    // 🌟 [세척 로직] 이 페이지에 들어오는 순간 모든 캐시를 파괴합니다. ㅡㅡ+
    console.log('유령 세션 세척 시작...')
    queryClient.clear()
    router.refresh()

    // localStorage.clear();
  }, [queryClient])

  const refInputUserId = useRef<HTMLInputElement>(null)
  const refInputPassword = useRef<HTMLInputElement>(null)

  const signIn = async (formData: FormData) => {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      body: formData,
      credentials: 'include', // 쿠키 포함
    })
    const resData = await response.json()
    if (!response.ok) {
      // TanStack Query가 실패를 인식하도록 에러를 던집니다.
      throw resData
      // throw new Error(errorData.message || "로그인 실패");
    }

    return resData // { result, accessToken }
  }

  const mutation = useMutation<any, ActionResponse, FormData>({
    mutationFn: signIn,
    onSuccess: async res => {
      // onSuccess를 async 함수로 변경
      const { type, data, element } = res

      if (type === 'error') {
        const errors = (res as any).fieldErrors || (element ? { [element]: res.message } : null)

        if (errors) {
          setFieldErrors(errors)
        } else {
          setFormMessage(res.message)
        }

        if (element === 'accountId' && refInputUserId.current) {
          refInputUserId.current.focus()
        }
        if (element === 'password' && refInputPassword.current) {
          refInputPassword.current.focus()
        }
        return
      }

      if (data) {
        setUser(res)
      }
      await queryClient.invalidateQueries({ queryKey: ['user'] })
      addToast('웹에서 로그인되었습니다.', 'info', {
        title: '로그인 알림',
        linkUrl: '/user/notifications',
      })

      router.replace('/')
    },
    onError: error => {
      const errors = (error as any).fieldErrors || ((error as any).element ? { [(error as any).element]: error.message } : null)

      if (errors) {
        setFieldErrors(errors)
        if (errors.accountId) refInputUserId.current?.focus()
        else if (errors.password) refInputPassword.current?.focus()
        return
      }

      setFormMessage(error.message || '서버 통신 중 오류가 발생했습니다.')
    },
  })

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormMessage(null)
    setFieldErrors(null)
    const formData = new FormData(e.currentTarget)

    mutation.mutate(formData)
  }

  const parentVariants = {
    hidden: { opacity: 0, x: 44 },
    onscreen: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
        delayChildren: 0.1,
        staggerChildren: 0.1,
      },
    },
    offscreen: {
      x: 44,
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
  }

  const UserIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
    </svg>
  )

  const LockIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33" />
    </svg>
  )

  const SignInIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  )

  return (
    <>
      <motion.div initial="hidden" animate="onscreen" variants={parentVariants} exit="offscreen">
        <form onSubmit={submitHandler}>
          <motion.div className="py-10" variants={parentVariants}>
            <div className="dark:text-dark-50 text-2xl font-semibold text-gray-700 text-center">Request Access</div>
            <div className="dark:text-dark-500 pt-10 text-sm text-gray-600 text-center">
              소셜로그인은 추후에 지원 됩니다. <br></br>일반 회원가입을 이용하셔도 모든 서비스를 이용 할 수 있습니다.
            </div>
          </motion.div>
          {formMessage && (
            <div className="mb-5 rounded-md bg-red-50 px-3 py-2 text-sm leading-6 text-red-500">
              {formMessage}
            </div>
          )}
          <motion.div variants={parentVariants}>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_210px] xl:grid-cols-[minmax(0,1fr)_220px]">
              <div>
                {/* Account ID Input */}
                <div className="mb-5">
                  <InputField
                    inputTitle="Account ID"
                    name="accountId"
                    type="text"
                    placeholder="아이디를 입력하세요"
                    icon={UserIcon}
                    ref={refInputUserId} // 이제 이 ref가 정상적으로 작동합니다.
                    error={fieldErrors?.accountId}
                  />
                </div>

                {/* 💡 비밀번호 입력 필드 */}
                <div className="mb-5">
                  <InputField
                    inputTitle="Password"
                    name="password"
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    icon={LockIcon}
                    ref={refInputPassword}
                    error={fieldErrors?.password}
                  />
                </div>

                {/* Submit Button */}
                <div className="mb-4 flex">
                  <Button isLoading={mutation.isPending} icon={SignInIcon} type="submit" fullWidth={true} className="!py-3">
                    Sign In
                  </Button>
                </div>
              </div>
              <QrLoginPanel />
            </div>
          </motion.div>
        </form>
        <motion.div className="divider" variants={parentVariants}>
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="dark:via-dark-600 h-px w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 text-xs text-gray-400 bg-white dark:bg-dark-950 backdrop-blur-sm">OR</span>
            </div>
          </div>
        </motion.div>
        <motion.div className="pb-8 pt-5" variants={parentVariants}>
          <div className="grid grid-cols-2 gap-2">
            <button className="dark:bg-dark-700/25 dark:hover:bg-dark-600/25 dark:text-dark-400 group col-span-2 flex cursor-pointer items-center justify-center rounded-md bg-gray-100 px-3 py-2 hover:bg-gray-200 sm:col-span-1 dark:hover:text-white">
              <div className="pr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="dark:fill-dark-400 h-5 w-5 fill-gray-500 stroke-1 group-hover:fill-gray-700 dark:group-hover:fill-white" width="512" height="512" viewBox="0 0 512 512">
                  <title>ionicons-v5_logos</title>
                  <path d="M349.13,136.86c-40.32,0-57.36,19.24-85.44,19.24C234.9,156.1,212.94,137,178,137c-34.2,0-70.67,20.88-93.83,56.45-32.52,50.16-27,144.63,25.67,225.11,18.84,28.81,44,61.12,77,61.47h.6c28.68,0,37.2-18.78,76.67-19h.6c38.88,0,46.68,18.89,75.24,18.89h.6c33-.35,59.51-36.15,78.35-64.85,13.56-20.64,18.6-31,29-54.35-76.19-28.92-88.43-136.93-13.08-178.34-23-28.8-55.32-45.48-85.79-45.48Z" />
                  <path d="M340.25,32c-24,1.63-52,16.91-68.4,36.86-14.88,18.08-27.12,44.9-22.32,70.91h1.92c25.56,0,51.72-15.39,67-35.11C333.17,85.89,344.33,59.29,340.25,32Z" />
                </svg>
              </div>
              <div className="dark:text-dark-400 text-xs text-gray-500 group-hover:text-gray-700 dark:group-hover:text-white">Apple</div>
            </button>
            <button className="dark:bg-dark-700/25 dark:hover:bg-dark-600/25 dark:text-dark-400 group col-span-2 flex cursor-pointer items-center justify-center rounded-md bg-gray-100 px-3 py-2 hover:bg-gray-200 sm:col-span-1 dark:hover:text-white">
              <div className="pr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="dark:fill-dark-400 h-5 w-5 fill-gray-500 stroke-1 group-hover:fill-gray-700 dark:group-hover:fill-white" width="512" height="512" viewBox="0 0 512 512">
                  <title>ionicons-v5_logos</title>
                  <path d="M256,32C132.3,32,32,134.9,32,261.7c0,101.5,64.2,187.5,153.2,217.9a17.56,17.56,0,0,0,3.8.4c8.3,0,11.5-6.1,11.5-11.4,0-5.5-.2-19.9-.3-39.1a102.4,102.4,0,0,1-22.6,2.7c-43.1,0-52.9-33.5-52.9-33.5-10.2-26.5-24.9-33.6-24.9-33.6-19.5-13.7-.1-14.1,1.4-14.1h.1c22.5,2,34.3,23.8,34.3,23.8,11.2,19.6,26.2,25.1,39.6,25.1a63,63,0,0,0,25.6-6c2-14.8,7.8-24.9,14.2-30.7-49.7-5.8-102-25.5-102-113.5,0-25.1,8.7-45.6,23-61.6-2.3-5.8-10-29.2,2.2-60.8a18.64,18.64,0,0,1,5-.5c8.1,0,26.4,3.1,56.6,24.1a208.21,208.21,0,0,1,112.2,0c30.2-21,48.5-24.1,56.6-24.1a18.64,18.64,0,0,1,5,.5c12.2,31.6,4.5,55,2.2,60.8,14.3,16.1,23,36.6,23,61.6,0,88.2-52.4,107.6-102.3,113.3,8,7.1,15.2,21.1,15.2,42.5,0,30.7-.3,55.5-.3,63,0,5.4,3.1,11.5,11.4,11.5a19.35,19.35,0,0,0,4-.4C415.9,449.2,480,363.1,480,261.7,480,134.9,379.7,32,256,32Z" />
                </svg>
              </div>
              <div className="dark:text-dark-400 text-xs text-gray-500 group-hover:text-gray-700 dark:group-hover:text-white">Github</div>
            </button>
            <button className="dark:bg-dark-700/25 dark:hover:bg-dark-600/25 dark:text-dark-400 group col-span-2 flex cursor-pointer items-center justify-center rounded-md bg-gray-100 px-3 py-2 hover:bg-gray-200 sm:col-span-1 dark:hover:text-white">
              <div className="pr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="dark:fill-dark-400 h-5 w-5 fill-gray-500 stroke-1 group-hover:fill-gray-700 dark:group-hover:fill-white" width="512" height="512" viewBox="0 0 512 512">
                  <title>ionicons-v5_logos</title>
                  <path d="M496,109.5a201.8,201.8,0,0,1-56.55,15.3,97.51,97.51,0,0,0,43.33-53.6,197.74,197.74,0,0,1-62.56,23.5A99.14,99.14,0,0,0,348.31,64c-54.42,0-98.46,43.4-98.46,96.9a93.21,93.21,0,0,0,2.54,22.1,280.7,280.7,0,0,1-203-101.3A95.69,95.69,0,0,0,36,130.4C36,164,53.53,193.7,80,211.1A97.5,97.5,0,0,1,35.22,199v1.2c0,47,34,86.1,79,95a100.76,100.76,0,0,1-25.94,3.4,94.38,94.38,0,0,1-18.51-1.8c12.51,38.5,48.92,66.5,92.05,67.3A199.59,199.59,0,0,1,39.5,405.6,203,203,0,0,1,16,404.2,278.68,278.68,0,0,0,166.74,448c181.36,0,280.44-147.7,280.44-275.8,0-4.2-.11-8.4-.31-12.5A198.48,198.48,0,0,0,496,109.5Z" />
                </svg>
              </div>
              <div className="dark:text-dark-400 text-xs text-gray-500 group-hover:text-gray-700 dark:group-hover:text-white">Twitter</div>
            </button>
            <button className="dark:bg-dark-700/25 dark:hover:bg-dark-600/25 dark:text-dark-400 group col-span-2 flex cursor-pointer items-center justify-center rounded-md bg-gray-100 px-3 py-2 hover:bg-gray-200 sm:col-span-1 dark:hover:text-white">
              <div className="pr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="dark:fill-dark-400 h-5 w-5 fill-gray-500 stroke-1 group-hover:fill-gray-700 dark:group-hover:fill-white" width="512" height="512" viewBox="0 0 512 512">
                  <path d="M473.16,221.48l-2.26-9.59H262.46v88.22H387c-12.93,61.4-72.93,93.72-121.94,93.72-35.66,0-73.25-15-98.13-39.11a140.08,140.08,0,0,1-41.8-98.88c0-37.16,16.7-74.33,41-98.78s61-38.13,97.49-38.13c41.79,0,71.74,22.19,82.94,32.31l62.69-62.36C390.86,72.72,340.34,32,261.6,32h0c-60.75,0-119,23.27-161.58,65.71C58,139.5,36.25,199.93,36.25,256S56.83,369.48,97.55,411.6C141.06,456.52,202.68,480,266.13,480c57.73,0,112.45-22.62,151.45-63.66,38.34-40.4,58.17-96.3,58.17-154.9C475.75,236.77,473.27,222.12,473.16,221.48Z" />
                </svg>
              </div>
              <div className="dark:text-dark-400 text-xs text-gray-500 group-hover:text-gray-700 dark:group-hover:text-white">Google</div>
            </button>
          </div>
        </motion.div>
        <motion.div className="pb-10" variants={parentVariants}>
          <div className="flex flex-wrap">
            <div className="w-full">
              <Link href="/auth/register" className="text-dark-500 group text-sm">
                회원가입을 하시려면
                <span className="dark:text-dark-200 dark:hover:text-dark-400 text-gray-500 underline hover:text-gray-600 group-hover:text-gray-600">회원가입 하기</span>
              </Link>
            </div>
            <div className="w-full">
              <Link href="/auth/find" className="text-dark-500 group text-sm">
                계정ID와 비밀번호를 잊어버리 셨나요?
                <span className="dark:text-dark-200 dark:hover:text-dark-400 text-gray-500 underline hover:text-gray-600 group-hover:text-gray-600">계정ID / 비밀번호 찾기</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  )
}

type QrLoginSession = {
  sessionId: string
  expiresAt: string
  ttlSeconds: number
  qrDataUrl: string
}

const QrLoginPanel = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [session, setSession] = useState<QrLoginSession | null>(null)
  const [statusMessage, setStatusMessage] = useState('QR을 불러오는 중입니다.')
  const [isLoading, setIsLoading] = useState(true)
  const [isExpired, setIsExpired] = useState(false)
  const [qrRefreshKey, setQrRefreshKey] = useState(0)
  const sessionIdRef = useRef<string | null>(null)
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const expireTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let isMounted = true

    const createSession = async () => {
      setIsLoading(true)
      setIsExpired(false)
      if (pollTimerRef.current) clearInterval(pollTimerRef.current)
      if (expireTimerRef.current) clearTimeout(expireTimerRef.current)

      try {
        const response = await fetch('/api/auth/qr', {
          method: 'POST',
          cache: 'no-store',
          credentials: 'include',
        })
        const data = await response.json()

        if (!isMounted) return

        if (!response.ok || !data.success) {
          setStatusMessage(data.message || 'QR을 만들지 못했습니다.')
          setSession(null)
          return
        }

        sessionIdRef.current = data.sessionId
        const expiresAtMs = new Date(data.expiresAt).getTime()
        setSession({
          sessionId: data.sessionId,
          expiresAt: data.expiresAt,
          ttlSeconds: data.ttlSeconds,
          qrDataUrl: data.qrDataUrl,
        })
        setStatusMessage('앱 인증기에서 QR을 스캔하세요.')
        expireTimerRef.current = setTimeout(() => {
          if (!isMounted) return
          sessionIdRef.current = null
          setIsExpired(true)
          setStatusMessage('QR이 만료되었습니다. 다시 발급해주세요.')
          if (pollTimerRef.current) clearInterval(pollTimerRef.current)
        }, Math.max(expiresAtMs - Date.now(), 0))
      } catch {
        if (isMounted) {
          setStatusMessage('QR 서버에 연결하지 못했습니다.')
          setSession(null)
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    const pollSession = async () => {
      const sessionId = sessionIdRef.current
      if (!sessionId) return

      try {
        const response = await fetch(`/api/auth/qr/status?sessionId=${encodeURIComponent(sessionId)}`, {
          method: 'GET',
          cache: 'no-store',
          credentials: 'include',
        })
        const data = await response.json()

        if (!isMounted) return

        if (response.ok && data.status === 'approved') {
          setStatusMessage('승인되었습니다. 이동합니다.')
          const userResponse = await fetch('/api/auth/me', {
            method: 'GET',
            cache: 'no-store',
            credentials: 'include',
          })
          const userData = await userResponse.json()

          if (userData?.isLoggedIn) {
            queryClient.setQueryData(['user'], userData)
          }

          await queryClient.invalidateQueries({ queryKey: ['user'] })
          await queryClient.refetchQueries({ queryKey: ['user'], exact: true })
          router.refresh()
          router.replace('/')
          return
        }

        if (data.status === 'expired') {
          sessionIdRef.current = null
          setIsExpired(true)
          setStatusMessage('QR이 만료되었습니다. 다시 발급해주세요.')
          if (pollTimerRef.current) clearInterval(pollTimerRef.current)
        }
      } catch {
        if (isMounted) setStatusMessage('QR 상태 확인을 다시 시도합니다.')
      }
    }

    void createSession()
    pollTimerRef.current = setInterval(pollSession, 2000)

    return () => {
      isMounted = false
      if (pollTimerRef.current) clearInterval(pollTimerRef.current)
      if (expireTimerRef.current) clearTimeout(expireTimerRef.current)
    }
  }, [queryClient, qrRefreshKey, router])

  return (
    <div className="self-start rounded-xl border border-gray-200 bg-gray-50/80 p-3 dark:border-dark-700 dark:bg-dark-900/40">
      <div className="mb-2 flex items-center justify-between gap-2 text-xs font-semibold text-gray-600 dark:text-dark-300">
        <div className="flex items-center gap-2">
          <Smartphone className="h-4 w-4" />
          App QR Login
        </div>
        {isLoading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
      </div>
      <div className="relative flex h-32 items-center justify-center rounded-2xl border border-gray-200 bg-white dark:border-dark-700 dark:bg-white">
        {session?.qrDataUrl ? (
          <img src={session.qrDataUrl} alt="앱 인증기 로그인 QR 코드" className={`h-24 w-24 rounded-md transition ${isExpired ? 'opacity-15 blur-[1px]' : ''}`} />
        ) : (
          <div className="flex flex-col items-center gap-1 text-gray-400 dark:text-dark-500">
            <QrCode className="h-16 w-16" strokeWidth={1.35} />
            <span className="text-[11px] font-medium">QR 준비 영역</span>
          </div>
        )}
        {isExpired && (
          <button
            type="button"
            onClick={() => {
              setQrRefreshKey(key => key + 1)
            }}
            className="absolute inset-0 flex items-center justify-center"
            aria-label="QR 다시 발급"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-lg shadow-gray-950/10 transition hover:bg-gray-50 dark:border-gray-200 dark:bg-white dark:text-gray-800">
              <RefreshCw className="h-5 w-5" />
            </span>
          </button>
        )}
      </div>
      <div className="mt-2 text-center text-[11px] leading-5 text-gray-500 dark:text-dark-400">
        {statusMessage}
      </div>
    </div>
  )
}

export default Signin
