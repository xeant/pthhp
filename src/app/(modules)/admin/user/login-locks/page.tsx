import LoginLockList from "@/modules/user/admin/loginLockList";
import { getLoginLockedUsersAdminAction } from "@/modules/user/actions/user.action";

const Page = async () => {
  const result = await getLoginLockedUsersAdminAction();
  const items = result.success && result.data ? result.data : [];

  return (
    <div className="mx-auto max-w-screen-2xl px-3 py-10">
      <LoginLockList items={items} />
    </div>
  );
};

export default Page;
