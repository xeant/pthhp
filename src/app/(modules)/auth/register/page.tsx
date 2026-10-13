import Register from "@/modules/user/tpl/default/register";
import { getAuthSettingsRuntimeAction } from "@/modules/admin/actions/auth-settings";
import { redirect } from "next/navigation";

const Page = async () => {
  const authSettings = await getAuthSettingsRuntimeAction();

  if (!authSettings.registrationEnabled) {
    redirect("/auth/signin?reason=registration-disabled");
  }

  return <Register />;
};

export default Page;
