import Admin from "@/modules/admin";
import { getNotificationSettingsAdminAction } from "@/modules/admin/actions/settings.action";

const Page = async () => {
  const result = await getNotificationSettingsAdminAction();

  return <Admin.Settings section="notification" initialNotificationSettings={result.data || undefined} />;
};

export default Page;
