import Admin from "@/modules/admin";
import { getSiteNavigationAdminAction } from "@/modules/admin/actions/sitemap.action";

const Page = async () => {
  const result = await getSiteNavigationAdminAction();

  return <Admin.Sitemap initialData={result.data} />;
};

export default Page;
