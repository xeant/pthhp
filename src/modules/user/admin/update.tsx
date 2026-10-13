import {
  getUserFullById
} from "@/modules/user/actions/user.action";
import { getAllGroupRecords } from "@/modules/user/actions/group.action";
import UpdateFormClient from "./updateClient";

type Props = {
  id: string;
};

const DashboardUserUpdate = async ({ id }: Props) => {
  const numericId = Number(id);
  const user = await getUserFullById(numericId);
  if (!user) throw new Error("사용자 정보를 찾을 수 없습니다.");

  const groupList = await getAllGroupRecords();
  console.log(user);
  return (
    <div className="max-w-screen-2xl mx-auto px-3">
      {user ? (
        <UpdateFormClient user={user} groupList={groupList} />
      ) : (
        <div>로딩 중...</div>
      )}
    </div>
  );
};

export default DashboardUserUpdate;
