"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import ModalPortal from "@/core/components/modal/ModalPortal";

interface ModalProps {
  state: boolean;
  close: (state: boolean) => void;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  position?: "center" | "top" | "bottom";
  escClose?: boolean;
  overlay?: boolean;
  overlayClose?: boolean;
  children: React.ReactNode;
}

const SIZE_MAP = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
};

const POSITION_MAP = {
  center: "items-center",
  top: "items-start pt-10",
  bottom: "items-end pb-10",
};

const ModalContext = createContext<{ close: () => void } | undefined>(undefined);

// 🌟 2. 편하게 쓰기 위한 커스텀 훅
export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error("useModal은 Modal 안에서만 쓸 수 있어요!");
  return context;
};

const Modal: React.FC<ModalProps> = ({
                                       state,
                                       close,
                                       size = "md",
                                       position = "center",
                                       escClose = true,
                                       overlay = true,
                                       overlayClose = true,
                                       children,
                                     }) => {
  // 🌟 퉁퉁거리는 효과를 위한 상태
  const [isDenied, setIsDenied] = useState(false);

  // 스크롤 잠금
  useEffect(() => {
    if (!state) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, [state]);

  // 🌟 ESC 키 이벤트 로직
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape" && state) {
        if (escClose) {
          close(false);
        } else {
          // 🌟 닫기 거부 시 효과 트리거
          setIsDenied(true);
          // 애니메이션이 끝날 즈음 상태 리셋
          setTimeout(() => setIsDenied(false), 300);
        }
      }
    };
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [state, escClose, close]);

  const overlayVariants: Variants = {
    open: { opacity: 1 },
    close: { opacity: 0 },
  };

  const contentVariants: Variants = {
    open: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", damping: 25, stiffness: 300 }
    },
    close: {
      opacity: 0,
      y: 20,
      scale: 0.95,
      transition: { duration: 0.2 }
    },
    // 🌟 여기를 수정합니다!
    denied: {
      opacity: 1, // 🌟 퉁퉁거리는 동안 투명해지지 않게 고정
      y: 0,       // 🌟 위치도 위아래로 튀지 않게 고정
      scale: [1, 1.04, 0.98, 1.02, 1],
      transition: { duration: 0.3 }
    }
  };

  return (
    <AnimatePresence>
      {state && (
        <ModalPortal>
          <div
            className={`fixed inset-0 z-[120] flex justify-center px-4 ${POSITION_MAP[position]}`}
            role="dialog"
            aria-modal="true"
          >
            {overlay && (
              <motion.div
                initial="close"
                animate="open"
                exit="close"
                variants={overlayVariants}
                onClick={() => overlayClose && close(false)}
                className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
              />
            )}

            <motion.div
              initial="close"
              // 🌟 isDenied가 true면 denied 애니메이션을, 아니면 open/close 상태 유지
              animate={isDenied ? "denied" : (state ? "open" : "close")}
              exit="close"
              variants={contentVariants}
              className={`relative z-[121] w-full ${SIZE_MAP[size]} overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-dark-800 dark:bg-dark-900`}
            >
              <ModalContext.Provider value={{ close: () => close(false) }}>
                {children}
              </ModalContext.Provider>
            </motion.div>
          </div>
        </ModalPortal>
      )}
    </AnimatePresence>
  );
};

export default Modal;
