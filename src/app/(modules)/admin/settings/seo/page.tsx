import Admin from "@/modules/admin";
import { getSeoSettingsAdminAction } from "@/modules/admin/actions/settings.action";

const Page = async () => {
  const result = await getSeoSettingsAdminAction();

  return <Admin.Settings section="seo" initialSeoSettings={result.data || undefined} />;
};

export default Page;
