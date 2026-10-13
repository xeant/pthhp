'use client'

import React, { useEffect, useState } from 'react'
import { getActiveUserList, forceLogout } from '@/widgets/admin/activeUser/activeUser'
import { ArrowLeft, RefreshCw, LogOut, Clock } from 'lucide-react' // Clock 아이콘 추가
import { useToastStore } from '@/core/store/useToastStore'
import Link from 'next/link'
import useRelativeTime from '@/core/hooks/date/useRelativeTime' // 🌟 훅 임포트

// 1. 🌟 테이블 행(Row) 컴포넌트 분리 (훅 사용을 위해) ㅡㅡ+
const UserRow = ({ user, onKick }: { user: any; onKick: (id: string, ip: string, name: string) => void }) => {
  // 이미 만들어두신 훅으로 "5분 전" 계산
  const timeAgo = useRelativeTime(user.loginAt)

  return (
    <tr className="hover:bg-gray-50/30 transition-colors dark:hover:bg-white/[0.04]">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[10px] text-blue-600 font-bold">{user.nickName?.charAt(0)}</div>
          <span className="text-sm font-medium text-gray-700 dark:text-dark-100">{user.nickName}</span>
        </div>
      </td>
      <td className="p-4 text-sm text-gray-500 font-mono dark:text-dark-300">{user.accountId || '-'}</td>
      <td className="p-4 text-sm text-gray-400 font-mono">{user.ip}</td>

      {/* 🌟 2. 접속 시간 컬럼 데이터 */}
      <td className="p-4 text-sm text-blue-500 font-medium">
        <div className="flex items-center gap-1">
          <Clock size={12} className="text-blue-300" />
          {timeAgo}
        </div>
      </td>

      <td className="p-4">
        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-600 rounded-md text-[10px] font-bold uppercase">
          <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
          Online
        </span>
      </td>
      <td className="p-4 text-right">
        <button onClick={() => onKick(user.id, user.ip, user.nickName)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all active:scale-90" title="강제 로그아웃">
          <LogOut size={16} />
        </button>
      </td>
    </tr>
  )
}

export default function ActiveUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const addToast = useToastStore(state => state.addToast)

  const loadData = async () => {
    setLoading(true)
    const data = await getActiveUserList()
    setUsers(data)
    setLoading(false)
  }

  const handleKick = async (userId: string, ip: string, nickName: string) => {
    if (!confirm(`${nickName}님을 강제로 로그아웃 시키겠습니까?`)) return

    // 🌟 서버 액션을 userId만 받도록 수정했다면 여기서 ip는 참고용으로만 남습니다.
    const res = await forceLogout(userId)
    if (res.success) {
      addToast(`${nickName}님을 추방했습니다.`, 'success')
      loadData()
    } else {
      addToast('추방에 실패했습니다.', 'error')
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="p-8 max-w-6xl mx-auto dark:text-dark-100">
      <header className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-full transition-all dark:hover:bg-dark-800">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">실시간 접속자 명단</h1>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 active:scale-95 transition-all dark:border-dark-700 dark:bg-dark-900 dark:text-dark-300 dark:hover:bg-dark-800">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          새로고침
        </button>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden dark:border-dark-800 dark:bg-dark-900 dark:shadow-black/20">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 dark:border-dark-800 dark:bg-dark-950/70">
              <th className="p-4 text-[11px] font-bold uppercase text-gray-400 tracking-wider">사용자</th>
              <th className="p-4 text-[11px] font-bold uppercase text-gray-400 tracking-wider">계정 ID</th>
              <th className="p-4 text-[11px] font-bold uppercase text-gray-400 tracking-wider">IP 주소</th>
              <th className="p-4 text-[11px] font-bold uppercase text-gray-400 tracking-wider">접속 시간</th>
              <th className="p-4 text-[11px] font-bold uppercase text-gray-400 tracking-wider">상태</th>
              <th className="p-4 text-[11px] font-bold uppercase text-gray-400 tracking-wider text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-dark-800">
            {users.map((user, i) => (
              <UserRow key={user.id || i} user={user} onKick={handleKick} />
            ))}
          </tbody>
        </table>
        {users.length === 0 && !loading && <div className="p-20 text-center text-gray-400 text-sm">현재 접속 중인 회원이 없습니다.</div>}
      </div>
    </div>
  )
}
