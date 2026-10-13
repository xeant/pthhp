import { adminDashboards } from "@extensions";
import { getPublicSiteSettingsAction } from "@/modules/admin/actions/settings.action";

const Page = async () => {
  const settings = await getPublicSiteSettingsAction();
  const adminLayoutKey = settings.data?.adminLayout || "project";
  const AdminDashboard = adminDashboards[adminLayoutKey] || adminDashboards.default;

  return <AdminDashboard />;
};

export default Page;
