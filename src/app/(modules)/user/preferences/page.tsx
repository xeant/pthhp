import { redirect } from "next/navigation";

import { getMyPreferenceAction } from "@/modules/user/actions/preference.action";
import { getPublicSiteSettingsAction } from "@/modules/admin/actions/settings.action";
import { userLayouts } from "@extensions";

const Page = async () => {
  const [result, settings] = await Promise.all([
    getMyPreferenceAction(),
    getPublicSiteSettingsAction(),
  ]);

  if (!result.success || !result.data) {
    redirect("/auth/signin?redirect=/user/preferences");
  }

  const userLayoutKey = settings.data?.userLayout || "default";
  const Preferences = userLayouts[userLayoutKey]?.preferences || userLayouts.default.preferences;

  return <Preferences initialPreference={result.data} />;
};

export default Page;
