import UpsertForm from "@/modules/user/admin/upsertForm";
import { getUserFullById } from "@/modules/user/actions/user.action";
import { getAllGroupRecords } from "@/modules/user/actions/group.action";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const user = await getUserFullById(Number(id)); // DB에서 유저 정보를 가져옴
  const groupList = await getAllGroupRecords();

  if (!user) return <div>유저를 찾을 수 없습니다.</div>;

  return (
    <div className="max-w-screen-2xl mx-auto px-3 py-10">
      {/* 💡 user 데이터를 넘깁니다! -> 자동으로 '수정 모드' 발동 */}
      <UpsertForm user={user} groupList={groupList} />
    </div>
  );
};

export default Page;
