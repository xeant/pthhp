export const dynamic = 'force-dynamic';
import { AuthLayout } from "@extensions";
import { getPublicSiteUrlAction } from '@/modules/admin/actions/settings.action';

const PageLayout = async ({ children }) => {
  const settings = await getPublicSiteUrlAction();

  return <AuthLayout siteUrl={settings.data?.siteUrl || "/"}>{children}</AuthLayout>
}

export default PageLayout
