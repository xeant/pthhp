import type { MetadataRoute } from "next";
import { getPublicSiteSettingsAction, getSeoSettingsRuntimeAction } from "@/modules/admin/actions/settings.action";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const [siteSettings, seoSettings] = await Promise.all([
    getPublicSiteSettingsAction(),
    getSeoSettingsRuntimeAction(),
  ]);
  const siteUrl = siteSettings.data?.siteUrl || "http://localhost:3000";
  const baseUrl = siteUrl.endsWith("/") ? siteUrl.slice(0, -1) : siteUrl;
  const allowIndex = seoSettings.robotsIndex === "index";

  return {
    rules: {
      userAgent: "*",
      allow: allowIndex ? "/" : undefined,
      disallow: allowIndex ? ["/admin", "/api", "/user"] : "/",
    },
    sitemap: seoSettings.sitemapEnabled ? `${baseUrl}/sitemap.xml` : undefined,
  };
}
