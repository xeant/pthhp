export const dynamic = 'force-dynamic';
import React from "react";
import { DefaultLayout } from "@extensions";
import { getPublicSiteSettingsAction } from "@/modules/admin/actions/settings.action";

export default async function PageLayout({
                                           children,

                                         }: {
  children: React.ReactNode
}) {
  const settings = await getPublicSiteSettingsAction();


  return (
    <DefaultLayout
      siteTitle={settings.data?.projectTitle}
    >
      {children}
    </DefaultLayout>
  );
}
