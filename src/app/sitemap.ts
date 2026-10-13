import type { MetadataRoute } from "next";
import { getPublicSitemapEntriesAction } from "@/modules/admin/actions/settings.action";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const result = await getPublicSitemapEntriesAction();
  const siteUrl = result.data?.siteUrl || "http://localhost:3000";
  const baseUrl = siteUrl.endsWith("/") ? siteUrl.slice(0, -1) : siteUrl;
  const entries = result.data?.entries || [];

  return entries.map((entry) => ({
    url: `${baseUrl}${entry.url.startsWith("/") ? entry.url : `/${entry.url}`}`,
    lastModified: entry.updatedAt || new Date(),
    changeFrequency: entry.url.startsWith("/posts/") ? "weekly" : "monthly",
    priority: entry.url === "/" ? 1 : entry.url.startsWith("/posts/") ? 0.7 : 0.8,
  }));
}
