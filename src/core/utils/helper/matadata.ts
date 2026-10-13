
import type { Metadata } from "next";
import { getPublicSiteSettingsAction, getSeoSettingsRuntimeAction } from "@/modules/admin/actions/settings.action";

interface SeoOptions {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
}

export async function getSeoMetadata({
  title,
  description,
  image,
  url,
  type = "website",
}: SeoOptions): Promise<Metadata> {
  const [settings, seoSettings] = await Promise.all([
    getPublicSiteSettingsAction(),
    getSeoSettingsRuntimeAction(),
  ]);

  const siteTitle = settings.data?.projectTitle || "Plextype";
  const siteUrl = settings.data?.siteUrl || "http://localhost:3000";
  const baseUrl = siteUrl.endsWith("/") ? siteUrl.slice(0, -1) : siteUrl;
  const pageTitle = title?.trim() || seoSettings.defaultTitle || siteTitle;
  const fullTitle = seoSettings.titleTemplate.includes("%s")
    ? seoSettings.titleTemplate.replace("%s", pageTitle)
    : `${pageTitle} ${seoSettings.titleTemplate}`.trim();
  const metaDescription = description?.trim() || seoSettings.metaDescription;
  const imageUrl = image || settings.data?.defaultOgImage || "/default-og.png";
  const fullUrl = url ? `${baseUrl}${url.startsWith("/") ? url : `/${url}`}` : baseUrl;
  const keywords = seoSettings.keywords
    ? seoSettings.keywords.split(",").map((keyword) => keyword.trim()).filter(Boolean)
    : undefined;

  return {
    metadataBase: new URL(baseUrl),
    title: fullTitle,
    description: metaDescription,
    manifest: "/manifest.webmanifest",
    keywords,
    alternates: {
      canonical: fullUrl,
    },
    robots: {
      index: seoSettings.robotsIndex === "index",
      follow: seoSettings.robotsFollow === "follow",
    },
    openGraph: {
      title: fullTitle,
      description: metaDescription,
      url: fullUrl,
      siteName: siteTitle,
      images: [{ url: imageUrl }],
      type,
    },
    twitter: {
      card: seoSettings.twitterCard,
      title: fullTitle,
      description: metaDescription,
      images: [imageUrl],
    },
    icons: {
      icon: settings.data?.faviconPath || "/favicon.ico",
    },
  };
}
