"use client";

import ProfileWrapper from "@/modules/user/tpl/default/ProfileWrapper";
import UserNavWrapper from "@/modules/user/tpl/default/UserNavWrapper";

const HeaderUser = (props: any) => {

  const userNav = [
    { title: "타임라인", route: "/user" },
    { title: "계정 프로필 설정", route: "/user/userUpdate" },
    { title: "개인 설정", route: "/user/preferences" },
    { title: "회원탈퇴", route: "/user/userDelete" },
  ];

  return (
    <>
      {/* ✅ 클라 전용 ProfileWrapper */}
      {/*<ProfileWrapper currentUser={currentUser} />*/}

      {/* ✅ 클라 전용 Nav */}
      <UserNavWrapper list={userNav} />

    </>
  );
};

export default HeaderUser;
