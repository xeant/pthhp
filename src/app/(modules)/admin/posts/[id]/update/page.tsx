// src/app/(extentions)/admin/posts/[id]/update/page.tsx
import DashboardPostCreate from "@/modules/posts/admin/create";
import { getPostsInfoByIdAction } from "@/modules/posts/actions/posts.action";
import { getGroups } from "@/modules/user/actions/group.action";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  // 💡 유저 페이지와 똑같이 서버에서 미리 데이터를 병렬로 땡겨옵니다!
  const [postRes, groupList] = await Promise.all([
    getPostsInfoByIdAction(Number(id)),
    getGroups(),
  ]);

  if (!postRes.success) return <div>게시판을 찾을 수 없습니다.</div>;

  return (
    <div className="max-w-screen-2xl mx-auto px-3 py-10">
      <DashboardPostCreate
        initialData={postRes.data}
        groupList={groupList}
        mid={id}
      />
    </div>
  );
};

export default Page;
