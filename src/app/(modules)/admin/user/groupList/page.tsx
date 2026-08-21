import DashboardUserGroupList from "@/modules/user/admin/groupList";
import { getAllGroupRecords } from "@/modules/user/actions/group.action";

const Page = async () => {
  const groupList = await getAllGroupRecords();

  return (
    <div className="max-w-screen-2xl mx-auto px-3 py-10">
      <DashboardUserGroupList initialGroupList={groupList} />
    </div>
  );
};

export default Page;
