"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { X } from "lucide-react";
import BottomPortal from "@/core/components/panel/BottomPortal";

const Bottom = ({ children, closeHref }: { children: React.ReactNode; closeHref?: string }) => {
  const router = useRouter();
  const [panelState, setPanelState] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeDelay = 280;

  useEffect(() => {
    setPanelState(true);
  }, []);

  useEffect(() => {
    if (panelState === true) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [panelState]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const variants: Variants = {
    openPanel: {
      y: "0%",
      transition: { duration: 0.26, ease: "easeOut" },
    },
    closePanel: {
      y: "100%",
      transition: { duration: 0.22, ease: "easeIn" },
    },
  };
  const variants2: Variants = {
    openPanel: {
      opacity: 1,
      transition: { duration: 0.18 },
    },
    closePanel: {
      opacity: 0,
      transition: { duration: 0.18 },
    },
  };
  const exit: Variants[string] = {
    y: "100%",
    transition: { duration: 0.22, ease: "easeIn" },
  };
  const exit2: Variants[string] = {
    opacity: 0,
    transition: { duration: 0.18 },
  };

  const goBack = useCallback(() => {
    if (closeHref) {
      router.push(closeHref);
      return;
    }

    router.back();
  }, [closeHref, router]);

  const handleClosePanel = useCallback(() => {
    setPanelState(false);

    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(goBack, closeDelay);
  }, [goBack]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClosePanel();
      }
    };

    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleClosePanel]);

  return (
    <>
      <AnimatePresence>
        {panelState && (
          <BottomPortal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={panelState === true ? "openPanel" : "closePanel"}
              variants={variants2}
              exit={exit2}
              onClick={handleClosePanel}
              className="dark:bg-dark-800/70 z-90 fixed inset-0 bg-gray-950/70"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={panelState === true ? "openPanel" : "closePanel"}
              variants={variants}
              exit={exit}
              drag="y"
              dragDirectionLock
              dragElastic={0.08}
              dragConstraints={{ top: 0, bottom: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 120 || info.velocity.y > 700) {
                  handleClosePanel();
                }
              }}
              className="z-101 fixed bottom-0 left-0 h-full w-full transform-gpu touch-pan-y will-change-transform"
            >
              <div className="relative flex h-10 w-full">
                <button
                  onClick={handleClosePanel}
                  className="z-101 absolute right-3 top-1 rounded-full p-2 text-gray-100 transition-colors hover:text-white dark:text-white"
                  aria-label="닫기"
                >
                  <X size={24} strokeWidth={1.5} />
                </button>
              </div>
              <div className="dark:bg-dark-950 dark:border-dark-800/75 dark:border-t-dark-600/50 mx-auto h-full w-full overflow-y-auto overflow-x-hidden overscroll-contain rounded-t-xl bg-white pt-5 shadow-md dark:border">
                <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-gray-300/90 dark:bg-dark-700" />
                {children}
              </div>
            </motion.div>
          </BottomPortal>
        )}
      </AnimatePresence>
    </>
  );
};
export default Bottom;
