import "./globals.css";
import "@extensions/styles/style.css";
import ReactQueryProvider from "@/core/providers/ReactQueryProvider";
import { UserProvider } from "@/core/providers/UserProvider";
import Log from "@/core/utils/debug/Log";
export const dynamic = 'force-dynamic';
import { ToastContainer } from "@/core/components/toast/toast";
import RealtimeNotificationListener from "@/core/components/toast/RealtimeNotificationListener";
import { getSeoMetadata } from "@/core/utils/helper/matadata";
import UserPreferenceBootstrap from "@/core/providers/UserPreferenceBootstrap";
import PwaWebPushBootstrap from "@/core/providers/PwaWebPushBootstrap";
import { cookies } from "next/headers";
import { getNotificationSettingsRuntimeAction } from "@/modules/admin/actions/settings.action";

export async function generateMetadata() {
  return getSeoMetadata({});
}

const APP_THEME_COLORS = {
  light: "#ffffff",
  dark: "#070a10",
} as const;

const themeInitScript = `
(function () {
  try {
    var storageKey = "userThemePreference";
    var cookieMatch = document.cookie.match(/(?:^|; )userThemePreference=([^;]*)/);
    var cookieTheme = cookieMatch ? decodeURIComponent(cookieMatch[1]) : "";
    var theme = cookieTheme || localStorage.getItem(storageKey) || "light";
    if (theme !== "light" && theme !== "dark") {
      theme = "light";
    }

    var shouldUseDark = theme === "dark";
    var root = document.documentElement;

    root.classList.toggle("dark", shouldUseDark);
    root.dataset.theme = theme;
    root.style.colorScheme = shouldUseDark ? "dark" : "light";
    localStorage.setItem(storageKey, theme);

    var themeColor = shouldUseDark ? "${APP_THEME_COLORS.dark}" : "${APP_THEME_COLORS.light}";
    var themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
      themeColorMeta = document.createElement("meta");
      themeColorMeta.setAttribute("name", "theme-color");
      document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.setAttribute("content", themeColor);

    var tileColorMeta = document.querySelector('meta[name="msapplication-TileColor"]');
    if (!tileColorMeta) {
      tileColorMeta = document.createElement("meta");
      tileColorMeta.setAttribute("name", "msapplication-TileColor");
      document.head.appendChild(tileColorMeta);
    }
    tileColorMeta.setAttribute("content", themeColor);
  } catch (error) {
    document.documentElement.dataset.theme = "light";
  }
})();
`;

const resolveThemePreference = (value?: string): "light" | "dark" => {
  if (value === "light" || value === "dark") return value;
  return "light";
};

export default async function RootLayout({ children }) {
  if (typeof globalThis.Log === "undefined") {
    globalThis.Log = Log;
  }

  const cookieStore = await cookies();
  const themePreference = resolveThemePreference(cookieStore.get("userThemePreference")?.value);
  const notificationSettings = await getNotificationSettingsRuntimeAction();

  return (
    <html
      suppressHydrationWarning
      data-theme={themePreference}
      className={`${themePreference === "dark" ? "dark " : ""}break-keep selection:bg-black selection:text-white dark:selection:bg-primary-400 dark:selection:text-white`}>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="gjworks" />
        <meta name="apple-mobile-web-app-status-bar-style" content={themePreference === "dark" ? "black-translucent" : "default"} />
        <meta name="theme-color" content={themePreference === "dark" ? APP_THEME_COLORS.dark : APP_THEME_COLORS.light} />
        <meta name="msapplication-TileColor" content={themePreference === "dark" ? APP_THEME_COLORS.dark : APP_THEME_COLORS.light} />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ReactQueryProvider>
          <UserProvider>
            <UserPreferenceBootstrap />
            <PwaWebPushBootstrap enabled={notificationSettings.pwaEnabled} />
            <RealtimeNotificationListener />

            {children}

            <ToastContainer position="top-right" />
            <div id="left"></div>
            <div id="right"></div>
            <div id="bottom"></div>
            <div id="modal"></div>
          </UserProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
