import Admin from "@/modules/admin";
import { getRecentCommentsAdminAction } from "@/modules/admin/actions/content.action";

const AdminContentCommentsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) => {
  const { page: pageParam } = (await searchParams) || {};
  const page = parseInt(pageParam ?? "1", 10);
  const result = await getRecentCommentsAdminAction(page, 20);
  const comments = result.success && result.data ? result.data.items : [];
  const navigation = result.success && result.data
    ? result.data.navigation
    : {
        totalCount: 0,
        totalPages: 0,
        page: 1,
        listCount: 0,
      };

  return <Admin.Content section="comments" initialComments={comments} navigation={navigation} />;
};

export default AdminContentCommentsPage;
