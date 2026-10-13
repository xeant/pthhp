import type { MetadataRoute } from "next";
import { getPublicSiteSettingsAction } from "@/modules/admin/actions/settings.action";

export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const siteSettings = await getPublicSiteSettingsAction();
  const appName = siteSettings.data?.appName || "plextype";
  const projectTitle = siteSettings.data?.projectTitle || appName;

  return {
    name: projectTitle,
    short_name: appName,
    description: `${projectTitle} web application`,
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone"],
    launch_handler: {
      client_mode: "navigate-existing",
    } as any,
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
