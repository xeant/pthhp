// src/app/(extentions)/admin/posts/create/page.tsx

import DashboardPostCreate from "@/modules/posts/admin/create";

import { getGroups } from "@/modules/user/actions/group.action";

const Page = async () => {
  // 💡 1. 생성할 때도 권한 설정을 위해 그룹 목록은 필요합니다!
  const groupList = await getGroups();

  // 💡 2. 생성 모드용 기본 데이터 세팅
  const defaultData = {
    id: 0,
    mid: "",
    moduleName: "",
    moduleDesc: "",
    config: {
      skin: "default",
      layout: "default",
      listCount: 20,
      pageCount: 10,
      documentLike: false,
      consultingState: false,
      secretPost: false,
    },
    permissions: {
      listPermissions: [],
      readPermissions: [],
      writePermissions: [],
      commentPermissions: [],
    },
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-3 py-10">

      {/* 💡 3. 필수 프롭들을 채워서 던져줍니다. pid는 "create"로! */}
      <DashboardPostCreate
        initialData={defaultData}
        groupList={groupList || []}
        mid="create"
      />
    </div>
  );
};

export default Page;
