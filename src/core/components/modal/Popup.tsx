"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import ModalPortal from "@/core/components/modal/ModalPortal";
import { X, ChevronLeft } from "lucide-react";

interface PopupProps {
  id: string;
  state: boolean;
  close: (state: boolean) => void;
  title?: string;
  children: React.ReactNode;
  days?: number;
  // 🌟 옵션 추가
  showFooter?: boolean;       // 푸터 영역 전체 노출 여부
  showBlockOption?: boolean;  // '오늘 하루 보지 않기' 노출 여부
  showCloseButton?: boolean;  // 하단 '닫기' 텍스트 버튼 노출 여부
  blockLabel?: string;        // '오늘 하루 보지 않기' 문구 커스텀
}

const Popup: React.FC<PopupProps> = ({
                                       id,
                                       state,
                                       close,
                                       title,
                                       children,
                                       days = 1,
                                       showFooter = true,       // 기본값 true
                                       showBlockOption = true,  // 기본값 true
                                       showCloseButton = true,  // 기본값 true
                                       blockLabel = "오늘 하루 보지 않기",
                                     }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const blockedUntil = localStorage.getItem(`popup_blocked_${id}`);
    if (blockedUntil) {
      const now = new Date().getTime();
      if (now < parseInt(blockedUntil)) {
        close(false);
        return;
      }
    }
    setIsVisible(state);
  }, [state, id, close]);

  const handleBlockPopup = () => {
    const expiryTime = new Date().getTime() + (days * 24 * 60 * 60 * 1000);
    localStorage.setItem(`popup_blocked_${id}`, expiryTime.toString());
    close(false);
  };

  const variants: Variants = {
    open: { y: 0, opacity: 1 },
    close: { y: "100%", opacity: 0 },
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <ModalPortal>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => close(false)}
            className="fixed inset-0 z-[90]"
          />

          <motion.div
            initial="close"
            animate="open"
            exit="close"
            variants={variants}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-1/2 z-[100] w-full max-w-xl -translate-x-1/2 px-4 pb-6 lg:pb-10"
          >
	            <div className="overflow-hidden rounded-2xl bg-white shadow-2xl backdrop-blur-2xl dark:border-dark-800 dark:bg-dark-900/90">

              {/* 헤더 */}
              <div className="flex items-center justify-between border-b border-black/[0.05] px-4 py-2 dark:border-white/[0.05]">
                <button onClick={() => close(false)} className="rounded-full p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                  <ChevronLeft size={20} />
                </button>
                <div className="flex-1 text-center text-sm font-bold tracking-tight text-zinc-900 dark:text-white">
                  {title}
                </div>
                <button onClick={() => close(false)} className="rounded-full p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                  <X size={20} />
                </button>
              </div>

              {/* 컨텐츠 */}
              <div className="max-h-[60vh] overflow-y-auto p-3 md:p-6">
                {children}
              </div>

              {/* 🌟 3. 하단 컨트롤러 영역 (조건부 렌더링) */}
              {showFooter && (showBlockOption || showCloseButton) && (
                <div className={`flex items-center border-t border-black/[0.05] bg-black/[0.02] px-6 py-3 dark:border-white/[0.05] dark:bg-white/[0.02] ${
                  showBlockOption && showCloseButton ? 'justify-between' : 'justify-end'
                }`}>
                  {showBlockOption && (
                    <button
                      onClick={handleBlockPopup}
                      className="text-[12px] text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-white"
                    >
                      {blockLabel}
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </ModalPortal>
      )}
    </AnimatePresence>
  );
};

export default Popup;
