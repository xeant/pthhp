"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface AccordionItem {
  id: string | number;
  title: React.ReactNode;
  content: React.ReactNode;
  isOpen?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean; // 여러 개를 동시에 열 수 있는지 여부
  className?: string;
  variant?: "default" | "nav";
}

const cn = (...classes: (string | boolean | undefined | null)[]) => {
  return classes.filter(Boolean).join(" ");
};

const Accordion = ({ items, allowMultiple = false, className, variant = "default" }: AccordionProps) => {
  // 개별 아이템의 열림 상태 관리
  const [openIds, setOpenIds] = useState<(string | number)[]>(
    items.filter((item) => item.isOpen).map((item) => item.id)
  );

  const toggleItem = (id: string | number) => {
    if (allowMultiple) {
      setOpenIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    } else {
      setOpenIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={cn("divide-y divide-gray-100 dark:divide-gray-800", className)}>
      {items.map((item) => (
        <AccordionRow
          key={item.id}
          item={item}
          isOpen={openIds.includes(item.id)}
          onClick={() => toggleItem(item.id)}
          variant={variant}
        />
      ))}
    </div>
  );
};

interface AccordionRowProps {
  item: AccordionItem;
  isOpen: boolean;
  onClick: () => void;
  variant: "default" | "nav";
}

const AccordionRow = ({ item, isOpen, onClick, variant }: AccordionRowProps) => {
  if (variant === "nav") {
    return (
      <div className="group">
        <button
          type="button"
          onClick={onClick}
          className="flex w-full cursor-pointer items-center gap-2 text-left"
        >
          <span className="min-w-0 flex-1">
            {item.title}
          </span>
          <motion.span
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="mr-3 flex size-3 shrink-0 items-center justify-center text-gray-950/35 dark:text-dark-400"
          >
            <ChevronRight className="size-3" />
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -6 }}
              animate={{ height: "auto", opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.04, 0.62, 0.23, 0.98] }}
              className="overflow-hidden"
            >
              <div className="space-y-1 pb-1">
                {item.content}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="group">
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 py-5 text-left transition-all cursor-pointer"
      >
        <motion.span
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="flex size-4 shrink-0 items-center justify-center text-primary-500"
        >
          <ChevronRight className="size-4" />
        </motion.span>
        <span className="text-base font-medium text-gray-900 dark:text-gray-100 transition-colors group-hover:text-primary-500">
          {item.title}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <div className="pb-6 pl-7 pr-4">
              <div className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {item.content}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Accordion;
