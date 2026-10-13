import Admin from "@/modules/admin";
import { getRecentAttachmentsAdminAction } from "@/modules/admin/actions/content.action";

const AdminContentAttachmentsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) => {
  const { page: pageParam } = (await searchParams) || {};
  const page = parseInt(pageParam ?? "1", 10);
  const result = await getRecentAttachmentsAdminAction(page, 24);
  const attachments = result.success && result.data ? result.data.items : [];
  const navigation = result.success && result.data
    ? result.data.navigation
    : {
        totalCount: 0,
        totalPages: 0,
        page: 1,
        listCount: 0,
      };

  return <Admin.Content section="attachments" initialAttachments={attachments} navigation={navigation} />;
};

export default AdminContentAttachmentsPage;
