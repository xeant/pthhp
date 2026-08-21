'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { hasClientSession } from '@/core/utils/auth/clientAuth';

export default function NotificationBell() {
  const [hasUnread, setHasUnread] = useState(false);
  const [mounted, setMounted] = useState(false);

  const checkNotifications = async () => {
    try {
      const hasSession = await hasClientSession();
      if (!hasSession) {
        setHasUnread(false);
        return;
      }

      const res = await fetch('/api/notifications/unread');
      if (!res.ok) throw new Error("알림 확인 실패");

      const data = await res.json();
      setHasUnread(Array.isArray(data) && data.length > 0);
    } catch (err) {
      setHasUnread(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    checkNotifications();

    // 🌟 [추가] 'new-notification' 신호가 오면 즉시 다시 확인!
    const handleNewNoti = () => {
      console.log("🔔 새 알림 신호 감지! 종 업데이트 중...");
      checkNotifications();
    };

    window.addEventListener('refresh-unread', handleNewNoti); // 이벤트 리스너 등록

    const timer = setInterval(checkNotifications, 60000);

    return () => {
      clearInterval(timer);
      window.removeEventListener('refresh-unread', handleNewNoti); // 클린업
    };
  }, []);

  if (!mounted) {
    return (
      <div className="relative rounded-full p-2 text-gray-500 dark:text-dark-300">
        <Bell size={20} />
      </div>
    );
  }

  // 🌟 공통되는 스타일과 위치 정보를 변수로 추출
  const dotClassName = "absolute top-2 right-2 w-2 h-2 rounded-full border border-white";
  const bgColor = "bg-red-600";

  return (
    <div className="group relative rounded-full p-2 text-gray-500 transition-all hover:bg-black/5 dark:text-dark-300 dark:hover:bg-white/[0.06]">
      <Bell size={20} className="transition-colors group-hover:text-black dark:group-hover:text-white" />

      <AnimatePresence>
        {hasUnread && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute top-2 right-2 flex items-center justify-center"
          >
            {/* 🌟 1. 뒤에서 은은하게 퍼져나가는 파동 (Ping 효과) */}
            <motion.span

            />

            {/* 🌟 2. 기존의 단단한 빨간 점 (고정) */}
            <span className="relative w-2 h-2 bg-red-600 rounded-full border-1 border-white z-10" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
