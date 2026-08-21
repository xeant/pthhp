import React from "react";

import { getPostsInfoAction } from "@/modules/posts/actions/posts.action";
import PostProvider from "@/modules/posts/tpl/default/PostProvider";
import PostNotFound from "@/modules/posts/tpl/default/notFound";
import { checkPermissionsAction } from "@/modules/posts/actions/permission.action";

import { cookies } from "next/headers";
import { verify } from "@utils/auth/jwtAuth";

interface CurrentUser {
  id: number;
  accountId: string;
  isAdmin: boolean;
  groups: number[]; // 사용자가 속한 그룹 ID 배열
  loggedIn: boolean; // 로그인 상태
}

export default async function PageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ pid: string; id: string }>;
}) {
  const { pid, id } = await params;

  // 1. 서버 액션 호출 (ActionState 반환)
  const result = await getPostsInfoAction(pid);

  // 2. 결과가 실패했거나 데이터가 없으면 404 처리
  if (!result.success || !result.data) {
    return <PostNotFound />;
  }

  // 데이터 추출 (이제 TypeScript가 PostInfoData로 인식합니다)
  const postData = result.data;

  let currentUser: CurrentUser | null = null;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (accessToken) {
    try {
      const decoded = await verify(accessToken);
      if (decoded) {
        currentUser = {
          ...decoded,
          isAdmin: Boolean(decoded.isAdmin),
          groups: decoded.groups || [],
          loggedIn: true,
        };
      }
    } catch (err) {
      console.log("JWT decode 실패", err);
    }
  }

  // 3. 권한 체크 (checkPermissions는 async이므로 반드시 await 필요!)
  const permissionResult = await checkPermissionsAction(
    postData.permissions,
    currentUser,
  );

  return (
    <PostProvider
      value={{ postInfo: postData, currentUser, permissions: permissionResult }}
    >
      {children}
    </PostProvider>
  );
}
