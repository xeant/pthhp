import Admin from "@/modules/admin";
import { getUploadSettingsAdminAction } from "@/modules/admin/actions/settings.action";

const Page = async () => {
  const result = await getUploadSettingsAdminAction();

  return <Admin.Settings section="upload" initialUploadSettings={result.data || undefined} />;
};

export default Page;
