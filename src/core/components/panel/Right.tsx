"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import RightPortal from "@/core/components/panel/RightPortal";
import { X } from "lucide-react";

const Right = ({ state, close, children }) => {
  // state(부모의 showRight)를 직접 사용해도 됩니다.
  // panelState를 굳이 또 만들면 싱크가 늦게 맞을 수 있어요.

  useEffect(() => {
    if (state === true) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [state]);

  const variants: Variants = {
    openPanel: {
      x: 0, // right 대신 x(translate)를 쓰는게 성능상 훨씬 부드러워요
      transition: { type: "spring", damping: 30, stiffness: 300, mass: 0.8 },
    },
    closePanel: {
      x: "100%", // 화면 밖으로 완전히 밀어냄
      transition: { duration: 0.3 },
    },
  };

  const handleClosePanel = () => {
    close(false);
  };

  return (
    <AnimatePresence>
      {state && (
        <RightPortal>
          {/* 1. 뒷배경 오버레이 (Portal 안에 있어야 함) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClosePanel}
            className="fixed inset-0 z-[99] bg-black/10 backdrop-blur-[2px]"
          />

          {/* 2. 슬라이드 패널 */}
          <motion.div
            initial={{ x: "100%" }} // 오른쪽 밖에서 시작
            animate="openPanel"
            exit="closePanel"
            variants={variants}
            // 🌟 z-index를 표준 방식으로 수정
            className="fixed bottom-0 right-0 top-0 z-[100] w-[400px] flex shadow-2xl"
          >

            {/* 실제 내용 (MymenuTemplate이 들어오는 곳) */}
            <div className="flex-1 overflow-hidden">
              {children}
            </div>
          </motion.div>
        </RightPortal>
      )}
    </AnimatePresence>
  );
};

export default Right;