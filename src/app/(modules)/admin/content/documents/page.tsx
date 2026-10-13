import Admin from "@/modules/admin";
import { getRecentDocumentsAdminAction } from "@/modules/admin/actions/content.action";

const AdminContentDocumentsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) => {
  const { page: pageParam } = (await searchParams) || {};
  const page = parseInt(pageParam ?? "1", 10);
  const result = await getRecentDocumentsAdminAction(page, 20);
  const documents = result.success && result.data ? result.data.items : [];
  const navigation = result.success && result.data
    ? result.data.navigation
    : {
        totalCount: 0,
        totalPages: 0,
        page: 1,
        listCount: 0,
      };

  return <Admin.Content section="documents" initialDocuments={documents} navigation={navigation} />;
};

export default AdminContentDocumentsPage;
