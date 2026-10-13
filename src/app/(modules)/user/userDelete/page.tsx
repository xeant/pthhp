import { getUserSessionAction } from "@/modules/user/actions/user.action";
import { redirect } from "next/navigation";
import { getPublicSiteSettingsAction } from "@/modules/admin/actions/settings.action";
import { userLayouts } from "@extensions";

const Page = async () => {
  const [userRes, settings] = await Promise.all([
    getUserSessionAction(),
    getPublicSiteSettingsAction(),
  ]);

  if (!userRes.success || !userRes.data) {
    redirect("/auth/signin");
  }

  const userLayoutKey = settings.data?.userLayout || "default";
  const UserDelete = userLayouts[userLayoutKey]?.delete || userLayouts.default.delete;

  return <UserDelete initialUser={userRes.data} />;
};

export default Page;
