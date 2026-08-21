import { redirect } from "next/navigation";

import { getUserTimelineAction } from "@/modules/user/actions/timeline.action";
import { getPublicSiteSettingsAction } from "@/modules/admin/actions/settings.action";
import { userLayouts } from "@extensions";

const Page = async () => {
  const [result, settings] = await Promise.all([
    getUserTimelineAction(),
    getPublicSiteSettingsAction(),
  ]);

  if (!result.success || !result.data) {
    redirect("/auth/signin");
  }

  const userLayoutKey = settings.data?.userLayout || "default";
  const Timeline = userLayouts[userLayoutKey]?.timeline || userLayouts.default.timeline;

  return <Timeline initialData={result.data} />;
};

export default Page;
