"use client";

export const APP_THEME_COLORS = {
  light: "#ffffff",
  dark: "#070a10",
} as const;

export type AppResolvedTheme = keyof typeof APP_THEME_COLORS;

export const syncThemeColorMeta = (theme: AppResolvedTheme) => {
  const color = APP_THEME_COLORS[theme];
  const head = document.head;

  let themeColorMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!themeColorMeta) {
    themeColorMeta = document.createElement("meta");
    themeColorMeta.name = "theme-color";
    head.appendChild(themeColorMeta);
  }

  themeColorMeta.content = color;

  let tileColorMeta = document.querySelector<HTMLMetaElement>('meta[name="msapplication-TileColor"]');
  if (!tileColorMeta) {
    tileColorMeta = document.createElement("meta");
    tileColorMeta.name = "msapplication-TileColor";
    head.appendChild(tileColorMeta);
  }

  tileColorMeta.content = color;
};
