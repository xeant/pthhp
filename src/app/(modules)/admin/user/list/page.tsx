import DashboardUserList from "@/modules/user/admin/list";
import { getUserListAction } from "@/modules/user/actions/user.action";

// 💡 Next.js 15+ 에서는 searchParams가 Promise로 들어옵니다.
const Page = async ({ searchParams }: { searchParams: Promise<{ page?: string; target?: string; keyword?: string }> }) => {
  const resolvedParams = await searchParams;

  const page = Number(resolvedParams.page) || 1;
  const keyword = resolvedParams.keyword || "";

  const validTargets = ["accountId", "nickName", "email_address"] as const;
  const target = validTargets.includes(resolvedParams.target as any)
    ? (resolvedParams.target as "accountId" | "nickName" | "email_address")
    : "accountId";

  // 💡 서버에서 직접 DB 데이터를 가져옵니다! (useEffect 필요 없음)
  const response = await getUserListAction({ page, target, keyword });

  // 안전하게 데이터 추출
  const userList = response.success && response.data ? response.data.userList : [];
  const navigation = response.success && response.data ? response.data.navigation : {
    totalCount: 0, totalPages: 0, page: 1, listCount: 0
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-3 py-10">
      {/* 💡 클라이언트 컴포넌트로는 '결과물'만 쓱 넘겨줍니다. */}
      <DashboardUserList initialUserList={userList} initialNavigation={navigation} />
    </div>
  );
};

export default Page;