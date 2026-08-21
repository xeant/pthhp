"use client";

import { useEffect } from "react";

import { useUserContext } from "@/core/providers/UserProvider";
import { syncThemeColorMeta } from "@/core/utils/theme/themeColor";

type ThemePreference = "light" | "dark";

const THEME_STORAGE_KEY = "userThemePreference";

const writeThemeCookie = (theme: ThemePreference) => {
  document.cookie = `${THEME_STORAGE_KEY}=${encodeURIComponent(theme)}; path=/; max-age=31536000; samesite=lax`;
};

const applyTheme = (theme: ThemePreference) => {
  const shouldUseDark = theme === "dark";

  document.documentElement.classList.toggle("dark", shouldUseDark);
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = shouldUseDark ? "dark" : "light";
  syncThemeColorMeta(shouldUseDark ? "dark" : "light");
  writeThemeCookie(theme);
};

const resolveStoredTheme = (value: string | null): ThemePreference => {
  if (value === "light" || value === "dark") return value;
  return "light";
};

const UserPreferenceBootstrap = () => {
  const { user, isLoading } = useUserContext();

  useEffect(() => {
    if (isLoading) return;

    const storedTheme = resolveStoredTheme(localStorage.getItem(THEME_STORAGE_KEY));
    const savedTheme = resolveStoredTheme(user?.preferences?.theme || storedTheme);
    applyTheme(savedTheme);
    localStorage.setItem(THEME_STORAGE_KEY, savedTheme);
  }, [isLoading, user?.preferences?.theme]);

  useEffect(() => {
    document.documentElement.dataset.motion = user?.preferences?.reduceMotion ? "reduced" : "default";
    document.documentElement.dataset.fontScale = user?.preferences?.fontScale || "normal";
  }, [user?.preferences?.fontScale, user?.preferences?.reduceMotion]);

  return null;
};

export default UserPreferenceBootstrap;
