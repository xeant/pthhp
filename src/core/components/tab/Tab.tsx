"use client";

import Link from "next/link";
import React, { useId, useMemo, useState } from "react";
import { motion } from "framer-motion";

export type TabVariant = "line" | "pill" | "boxed";
export type TabSize = "sm" | "md" | "lg";

export interface TabItem {
  value: string;
  label: React.ReactNode;
  content?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  href?: string;
  disabled?: boolean;
}

export interface TabProps {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, item: TabItem) => void;
  variant?: TabVariant;
  size?: TabSize;
  fullWidth?: boolean;
  keepMounted?: boolean;
  renderPanel?: boolean;
  ariaLabel?: string;
  className?: string;
  listClassName?: string;
  triggerClassName?: string;
  panelClassName?: string;
}

const sizeClassMap: Record<TabSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-sm",
};

const getListClassName = (variant: TabVariant) => {
  if (variant === "pill") {
    return "gap-1 rounded-lg bg-gray-100 p-1 dark:bg-dark-900";
  }

  if (variant === "boxed") {
    return "gap-2 border-b border-gray-200 dark:border-dark-800";
  }

  return "gap-6 border-b border-gray-200 dark:border-dark-800";
};

const getTriggerClassName = (variant: TabVariant, isActive: boolean, isDisabled?: boolean) => {
  const baseClassName = "relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium tracking-normal transition-colors outline-none focus-visible:ring-2 focus-visible:ring-gray-900/10 dark:focus-visible:ring-white/20";
  const disabledClassName = isDisabled ? "pointer-events-none opacity-45" : "cursor-pointer";

  if (variant === "pill") {
    const stateClassName = isActive
      ? "text-gray-950 dark:text-white"
      : "text-gray-500 hover:text-gray-900 dark:text-dark-300 dark:hover:text-white";

    return `${baseClassName} ${disabledClassName} ${stateClassName}`;
  }

  if (variant === "boxed") {
    const stateClassName = isActive
      ? "border-gray-300 bg-white text-gray-950 shadow-sm dark:border-dark-700 dark:bg-dark-900 dark:text-white"
      : "border-transparent text-gray-500 hover:border-gray-200 hover:bg-gray-50 hover:text-gray-900 dark:text-dark-300 dark:hover:border-dark-700 dark:hover:bg-dark-900 dark:hover:text-white";

    return `${baseClassName} ${disabledClassName} border ${stateClassName}`;
  }

  const stateClassName = isActive
    ? "text-gray-950 dark:text-white"
    : "text-gray-500 hover:text-gray-900 dark:text-dark-300 dark:hover:text-white";

  return `${baseClassName} ${disabledClassName} rounded-none ${stateClassName}`;
};

const Tab = ({
  items,
  value,
  defaultValue,
  onChange,
  variant = "line",
  size = "md",
  fullWidth = false,
  keepMounted = false,
  renderPanel = true,
  ariaLabel = "Tabs",
  className = "",
  listClassName = "",
  triggerClassName = "",
  panelClassName = "",
}: TabProps) => {
  const tabId = useId();
  const enabledItems = useMemo(() => items.filter((item) => !item.disabled), [items]);
  const firstValue = enabledItems[0]?.value || items[0]?.value || "";
  const [internalValue, setInternalValue] = useState(defaultValue || firstValue);
  const activeValue = value ?? internalValue;
  const activeItem = items.find((item) => item.value === activeValue);

  const selectTab = (item: TabItem) => {
    if (item.disabled) return;
    if (value === undefined) setInternalValue(item.value);
    onChange?.(item.value, item);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    if (!enabledItems.length) return;

    event.preventDefault();
    const currentIndex = Math.max(0, enabledItems.findIndex((item) => item.value === activeValue));
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? enabledItems.length - 1
          : event.key === "ArrowRight"
            ? (currentIndex + 1) % enabledItems.length
            : (currentIndex - 1 + enabledItems.length) % enabledItems.length;

    selectTab(enabledItems[nextIndex]);
  };

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        onKeyDown={onKeyDown}
        className={`relative flex min-w-0 overflow-x-auto scrollbar-hide ${fullWidth ? "w-full" : "w-fit max-w-full"} ${getListClassName(variant)} ${listClassName}`}
      >
        {items.map((item) => {
          const isActive = item.value === activeValue;
          const tabControlId = `${tabId}-panel-${item.value}`;
          const tabButtonId = `${tabId}-tab-${item.value}`;
          const triggerClassNames = `${getTriggerClassName(variant, isActive, item.disabled)} ${sizeClassMap[size]} ${fullWidth ? "flex-1" : ""} ${triggerClassName}`;
          const content = (
            <>
              {variant === "pill" && isActive && (
                <motion.span
                  layoutId={`${tabId}-active-pill`}
                  className="absolute inset-0 rounded-md bg-white shadow-sm dark:bg-dark-800"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex min-w-0 items-center justify-center gap-2">
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span className="shrink-0 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] leading-none text-gray-500 dark:bg-dark-800 dark:text-dark-300">
                    {item.badge}
                  </span>
                )}
              </span>
              {variant === "line" && isActive && (
                <motion.span
                  layoutId={`${tabId}-active-line`}
                  className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-gray-950 dark:bg-white"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                />
              )}
            </>
          );

          if (item.href && !item.disabled) {
            return (
              <Link
                key={item.value}
                id={tabButtonId}
                href={item.href}
                role="tab"
                aria-selected={isActive}
                aria-controls={tabControlId}
                tabIndex={isActive ? 0 : -1}
                onClick={() => selectTab(item)}
                className={triggerClassNames}
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={item.value}
              id={tabButtonId}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={tabControlId}
              tabIndex={isActive ? 0 : -1}
              disabled={item.disabled}
              onClick={() => selectTab(item)}
              className={triggerClassNames}
            >
              {content}
            </button>
          );
        })}
      </div>

      {renderPanel && (
        <div className={panelClassName}>
          {keepMounted
            ? items.map((item) => (
              <div
                key={item.value}
                id={`${tabId}-panel-${item.value}`}
                role="tabpanel"
                aria-labelledby={`${tabId}-tab-${item.value}`}
                hidden={item.value !== activeValue}
              >
                {item.content}
              </div>
            ))
            : activeItem?.content && (
              <div
                id={`${tabId}-panel-${activeItem.value}`}
                role="tabpanel"
                aria-labelledby={`${tabId}-tab-${activeItem.value}`}
              >
                {activeItem.content}
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default Tab;
