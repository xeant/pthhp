import DashboardUserList from "@/modules/user/admin/list";
import { getUserListAction } from "@/modules/user/actions/user.action";

const Page = async ({ searchParams }: { searchParams: Promise<{ page?: string; target?: string; keyword?: string }> }) => {
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams.page) || 1;
  const keyword = resolvedParams.keyword || "";
  const validTargets = ["accountId", "nickName", "email_address"] as const;
  const target = validTargets.includes(resolvedParams.target as any)
    ? (resolvedParams.target as "accountId" | "nickName" | "email_address")
    : "accountId";

  const response = await getUserListAction({ page, target, keyword, status: "pending" });
  const userList = response.success && response.data ? response.data.userList : [];
  const navigation = response.success && response.data ? response.data.navigation : {
    totalCount: 0,
    totalPages: 0,
    page: 1,
    listCount: 0,
  };

  return (
    <div className="mx-auto max-w-screen-2xl px-3 py-10">
      <DashboardUserList
        initialUserList={userList}
        initialNavigation={navigation}
        title="가입 대기 회원"
        description={`승인 대기 상태인 회원 ${navigation.totalCount}명 중 ${userList.length}명을 표시하고 있습니다.`}
        basePath="/admin/user/pending"
      />
    </div>
  );
};

export default Page;
