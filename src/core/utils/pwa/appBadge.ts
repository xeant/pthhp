"use client";

type NavigatorWithBadge = Navigator & {
  setAppBadge?: (contents?: number) => Promise<void>;
  clearAppBadge?: () => Promise<void>;
};

export const clearPwaAppBadge = async () => {
  if (typeof navigator === "undefined") return;

  const badgeNavigator = navigator as NavigatorWithBadge;
  if (!badgeNavigator.clearAppBadge) return;

  try {
    await badgeNavigator.clearAppBadge();
  } catch {
  }
};

export const setPwaAppBadge = async (count: number) => {
  if (typeof navigator === "undefined") return;

  const badgeNavigator = navigator as NavigatorWithBadge;
  if (count > 0 && badgeNavigator.setAppBadge) {
    try {
      await badgeNavigator.setAppBadge(count);
    } catch {
    }
    return;
  }

  await clearPwaAppBadge();
};
