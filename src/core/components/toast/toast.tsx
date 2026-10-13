"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useToastStore, ToastPosition } from "@/core/store/useToastStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

// 상수 설정
const TOAST_HEIGHT = 72;
const VISIBLE_AMOUNT = 3;

const positionClasses: Record<ToastPosition, string> = {
  "top-left": "top-8 left-8 items-start",
  "top-center": "top-8 left-1/2 -translate-x-1/2 items-center",
  "top-right": "top-8 right-8 items-end",
  "bottom-left": "bottom-8 left-8 items-start",
  "bottom-center": "bottom-8 left-1/2 -translate-x-1/2 items-center",
  "bottom-right": "bottom-8 right-8 items-end",
};

/**
 * 🌟 개별 토스트 아이템 컴포넌트
 * 마우스 호버 시 타이머가 정지되는 로직이 들어있습니다.
 */
const ToastItem = ({
                     toast,
                     index,
                     isTop,
                     isHovered,
                     removeToast,
                     router,
                   }: {
  toast: any;
  index: number;
  isTop: boolean;
  isHovered: boolean;
  removeToast: any;
  router: any;
}) => {
  useEffect(() => {
    // 🌟 마우스가 올라가 있지 않을 때만 타이머 작동 (호버 시 중단)
    if (!isHovered) {
      const timer = setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration || 5000);

      return () => clearTimeout(timer);
    }
  }, [isHovered, toast.id, toast.duration, removeToast]);

  return (
    <motion.div
      layout
      onClick={() => {
        if (toast.linkUrl) {
          router.push(toast.linkUrl);
          removeToast(toast.id);
        }
      }}
      initial={{ opacity: 0, y: isTop ? -20 : 20, scale: 0.9 }}
      animate={{
        opacity: isHovered ? 1 : 1 - index * 0.2,
        y: isHovered
          ? index * (isTop ? TOAST_HEIGHT + 12 : -(TOAST_HEIGHT + 12))
          : index * (isTop ? 10 : -10),
        scale: isHovered ? 1 : 1 - index * 0.05,
        zIndex: 100 - index,
      }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`absolute ${isTop ? "top-0" : "bottom-0"} pointer-events-auto cursor-pointer`}
    >
      <div className={`
        flex items-start gap-3.5 px-4 py-4
        bg-white/90 backdrop-blur-xl border border-zinc-200/50 rounded-[22px]
        shadow-[0_15px_45px_rgba(0,0,0,0.08)]
        dark:border-dark-800/80 dark:bg-dark-900/92 dark:shadow-[0_18px_48px_rgba(0,0,0,0.34)]
        min-w-[360px] w-max max-w-[440px]
      `}>
        {/* 아이콘/이미지 영역 */}
        <div className="shrink-0 pt-0.5">
          {toast.imageUrl ? (
            <img
              src={toast.imageUrl}
              alt="toast-icon"
              className="w-10 h-10 rounded-xl object-cover shadow-sm border border-black/5 dark:border-white/10"
            />
          ) : (
            <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center border border-zinc-100 shadow-sm dark:border-dark-700 dark:bg-dark-800">
              <StatusIcon type={toast.type} />
            </div>
          )}
        </div>

        {/* 텍스트 영역 */}
        <div className="flex-1 min-w-0 flex flex-col gap-0.5 pr-2">
          <div className="text-[14px] font-bold text-zinc-900 tracking-tight leading-tight dark:text-dark-50">
            {toast.title || "알림"}
          </div>
          <p className="text-[13px] font-medium text-zinc-500 leading-snug break-words dark:text-dark-300">
            {toast.message}
          </p>
        </div>

        {/* 닫기 버튼 */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // 🌟 중요: 닫기 버튼 클릭 시 게시글 이동 방지
            removeToast(toast.id);
          }}
          className="text-zinc-300 hover:text-zinc-900 p-1 transition-colors pt-0.5 dark:text-dark-500 dark:hover:text-dark-100"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
      </div>
    </motion.div>
  );
};

/**
 * 🌟 토스트 컨테이너 컴포넌트
 */
export const ToastContainer = ({ position = "bottom-right" }: { position?: ToastPosition }) => {
  const { toasts, removeToast } = useToastStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const isTop = position.includes("top");

  return createPortal(
    <div className="fixed inset-0 z-[100000] pointer-events-none">
      <section
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`absolute flex flex-col ${positionClasses[position]}`}
      >
        <div className="relative flex flex-col items-center min-w-[360px]">
          <AnimatePresence mode="popLayout" initial={false}>
            {[...toasts]
              .reverse()
              .map((toast, index) => {
                // 상단에 보이는 개수 제한 (호버 시에는 모두 보여줌)
                const isVisible = index < VISIBLE_AMOUNT || isHovered;
                if (!isVisible) return null;

                return (
                  <ToastItem
                    key={toast.id}
                    toast={toast}
                    index={index}
                    isTop={isTop}
                    isHovered={isHovered}
                    removeToast={removeToast}
                    router={router}
                  />
                );
              })}
          </AnimatePresence>
        </div>
      </section>
    </div>,
    document.body
  );
};

/**
 * 상태별 아이콘 컴포넌트
 */
const StatusIcon = ({ type }: { type: any }) => {
  const icons = {
    success: <CheckCircle2 size={18} className="text-blue-500 stroke-[2.5px]" />,
    error: <AlertCircle size={18} className="text-red-500 stroke-[2.5px]" />,
    warning: <AlertTriangle size={18} className="text-amber-500 stroke-[2.5px]" />,
    info: <Info size={18} className="text-zinc-400 stroke-[2.5px] dark:text-dark-300" />,
  };
  return icons[type as keyof typeof icons] || icons.info;
};
