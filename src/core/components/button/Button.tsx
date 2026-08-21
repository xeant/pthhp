"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children?: React.ReactNode;
  isLoading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = ({
                  isLoading = false,
                  icon,
                  fullWidth = false,
                  children,
                  className = "",
                  disabled,
                  type = "button",
                  ...props
                }: ButtonProps) => {

  const baseClasses = "relative inline-flex items-center justify-center rounded px-5 py-2 text-xs font-medium transition-colors duration-200 focus:outline-none disabled:cursor-not-allowed cursor-pointer outline-none overflow-hidden";
  const themeClasses = "bg-gray-100 text-gray-700 hover:bg-gray-800 hover:text-gray-200 disabled:bg-gray-200 disabled:text-gray-400 dark:bg-dark-800 dark:text-dark-100 dark:hover:bg-dark-700 dark:hover:text-white dark:disabled:bg-dark-900 dark:disabled:text-dark-600";
  const widthClass = fullWidth ? "w-full" : "w-auto";

  return (
    <motion.button
      type={type}
      disabled={isLoading || disabled}

      // 🎯 애니메이션 핵심 설정
      initial={{ scale: 1 }}
      whileHover={{ scale: 0.98 }} // 호버 시 아주 살짝 작아짐
      whileTap={{ scale: 0.94 }}   // 클릭 시 더 쫀득하게 작아짐
      transition={{
        type: "spring",
        stiffness: 400, // 강성 (높을수록 팽팽함)
        damping: 17     // 감쇠 (낮을수록 더 많이 튕김)
      }}

      className={`${baseClasses} ${themeClasses} ${widthClass} ${className}`}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin"></span>
        ) : (
          <>
            {icon && <span className="flex items-center shrink-0">{icon}</span>}
            {children && <span className="truncate">{children}</span>}
          </>
        )}
      </div>
    </motion.button>
  );
};

export default Button;
