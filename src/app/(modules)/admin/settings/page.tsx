import Admin from "@/modules/admin";
import { getSiteSettingsAdminAction } from "@/modules/admin/actions/settings.action";
import { adminLayoutOptions, userLayoutOptions } from "@extensions";

const Page = async () => {
  const result = await getSiteSettingsAdminAction();

  return (
    <Admin.Settings
      section="site"
      initialSiteSettings={result.data || undefined}
      adminLayoutOptions={adminLayoutOptions}
      userLayoutOptions={userLayoutOptions}
    />
  );
};

export default Page;
