import React from "react";
import { cookies } from "next/headers";
import { verify } from "@utils/auth/jwtAuth";

// 기존 액션 및 프로바이더 임포트
import { getPostsInfoAction } from "@/modules/posts/actions/posts.action";
import { checkPermissionsAction } from "@/modules/posts/actions/permission.action";
import PostProvider from "@/modules/posts/tpl/default/PostProvider"; // 실제 컨텍스트 프로바이더
import PostNotFound from "@/modules/posts/tpl/default/notFound";

// 1. 권한 기본값 정의 (Permissions가 null일 때 에러 방지용)
const DEFAULT_PERMISSIONS = {
  doList: false,
  doRead: false,
  doWrite: false,
  doComment: false,
};

// 2. 유저 정보 가져오기 함수 (타입 동기화)
async function getCurrentUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) return null;

  try {
    const decoded = await verify(accessToken);
    // decoded 객체의 구조가 PostProvider에서 기대하는 유저 타입과 맞아야 합니다.
    if (decoded?.id) {
      return {
        ...decoded,
        isAdmin: Boolean(decoded.isAdmin),
        groups: decoded.groups || [],
        loggedIn: true,
      };
    }
  } catch (err) {
    console.log("JWT decode 실패");
  }
  return null;
}

export default async function PostsProvider({
  pid,
  children,
}: {
  pid: string;
  children: React.ReactNode;
}) {
  // A. 게시판 정보 요청
  const res = await getPostsInfoAction(pid);
  const postInfo = res.success ? res.data : null;

  // 💡 [해결] postInfo가 없으면 아예 Provider를 렌더링하지 않고 404 처리
  if (!postInfo) {
    return <PostNotFound />;
  }

  // B. 유저 정보 및 권한 체크
  const currentUser = await getCurrentUser();
  const permissionResult = await checkPermissionsAction(
    postInfo.permissions,
    currentUser,
  );

  // 💡 [해결] permissions 타입 에러 해결: 결과가 null이면 기본값(false 객체)을 넘겨줌
  const permissions = permissionResult ?? DEFAULT_PERMISSIONS;

  return (
    // 이제 postInfo와 permissions는 절대 null이 아님을 보장합니다.
    <PostProvider value={{ postInfo, currentUser, permissions }}>
      {children}
    </PostProvider>
  );
}
