import { Users } from "lucide-react";

import { defineModule, defineUserSkin } from "@/core/registry/define";
import UserDelete from "@/modules/user/tpl/default/delete";
import UserPreferences from "@/modules/user/tpl/default/preferences";
import UserTimeline from "@/modules/user/tpl/default/timeline";
import UserUpdate from "@/modules/user/tpl/default/update";

export const userModule = defineModule({
  key: "user",
  label: "회원",
  description: "회원 관리 메뉴와 기본 사용자 마이페이지 스킨을 제공합니다.",
  admin: {
    menu: {
      id: "users",
      icon: <Users size={18} />,
      label: "회원 설정",
      order: 20,
      items: [
        { label: "회원 목록", href: "/admin/user/list" },
        { label: "로그인 된 회원", href: "/admin/user/active" },
        { label: "가입 대기 회원", href: "/admin/user/pending" },
        { label: "로그인 잠금", href: "/admin/user/login-locks" },
        { label: "회원 추가", href: "/admin/user/create" },
        { label: "회원 그룹 관리", href: "/admin/user/groupList" },
      ],
    },
    breadcrumbs: {
      user: {
        list: "LIST",
        create: "CREATE",
        groupList: "GROUPS",
        pending: "PENDING",
        "login-locks": "LOGIN LOCKS",
        update: "UPDATE",
        active: "ACTIVE",
      },
    },
  },
  userSkins: [
    defineUserSkin({
      key: "default",
      label: "기본 사용자",
      description: "Plextype 배포판에 포함되는 기본 사용자 화면입니다.",
      timeline: UserTimeline,
      update: UserUpdate,
      preferences: UserPreferences,
      delete: UserDelete,
    }),
  ],
});
