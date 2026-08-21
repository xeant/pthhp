import Admin from "@/modules/admin";
import { getAuthSettingsAdminAction, getSiteSettingsAdminAction } from "@/modules/admin/actions/settings.action";
import { adminLayoutOptions, userLayoutOptions } from "@extensions";

const Page = async () => {
  const [authResult, siteResult] = await Promise.all([
    getAuthSettingsAdminAction(),
    getSiteSettingsAdminAction(),
  ]);

  return (
    <Admin.Settings
      section="auth"
      initialAuthSettings={authResult.data || undefined}
      initialSiteSettings={siteResult.data || undefined}
      adminLayoutOptions={adminLayoutOptions}
      userLayoutOptions={userLayoutOptions}
    />
  );
};

export default Page;
