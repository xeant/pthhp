import React from "react";
import { cookies, headers } from "next/headers";
import { verify } from "@utils/auth/jwtAuth";

// Actions & Utils
import { getPostsInfoAction } from "@/modules/posts/actions/posts.action";
import {
  getDocumentList,
  getDocument,
  saveDocument,
  increaseViewCount,
  getDocumentBySlugAction,
} from "@/modules/document/actions/document.action";
import { checkPermissionsAction } from "@/modules/posts/actions/permission.action";
import {
  getCommentsAction,
  getParticipantsAction,
  saveCommentAction,
  removeCommentAction,
} from "@/modules/comment/actions/comment.action";

// UI Helpers
import PostNotFound from "@/modules/posts/tpl/default/notFound";
import PostProvider from "@/modules/posts/tpl/default/PostProvider";

// 🌟 [Default Skins] 아무것도 안 넘겼을 때 입을 기본 옷들
import DefaultListSkin from "@/modules/posts/tpl/default/list";
import DefaultReadSkin from "@/modules/posts/tpl/default/read";
import DefaultCommentsSkin from "@/modules/comment/tpl/list";
import DefaultWriteSkin from "@/modules/posts/tpl/default/write";
import SecretUnlock from "@/modules/posts/tpl/default/secretUnlock";
import CommentListStatic from "@/modules/comment/tpl/commentListStatic";
import { normalizeSkinName, postSkinRegistry } from "@/modules/posts/tpl/skinRegistry";
import { getPostSkinCapability } from "@/modules/posts/actions/skinCapability";

/** 💡 공통 서버 유저 헬퍼 */
async function getServerUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  if (!token)
    return {
      id: 0,
      accountId: "",
      isAdmin: false,
      groups: [],
      loggedIn: false,
    };
  try {
    const verified = await verify(token);
    if (!verified?.id) throw new Error("Invalid token");
    return {
      ...verified,
      isAdmin: Boolean(verified.isAdmin),
      groups: verified.groups || [],
      loggedIn: true,
    };
  } catch {
    return {
      id: 0,
      accountId: "",
      isAdmin: false,
      groups: [],
      loggedIn: false,
    };
  }
}

/**
 * 🧩 1. 목록 블록 (Post.List)
 */
async function PostList({
  mid,
  page = 1,
  limit = 10,
  category,
  status,
  Skin, // 👈 스킨 주입
}: {
  mid: string;
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  Skin?: React.ComponentType<any>;
}) {
  const [infoRes, listRes, user] = await Promise.all([
    getPostsInfoAction(mid),
    getDocumentList(mid, page, limit, category, status),
    getServerUser(),
  ]);

  if (!infoRes.success || !infoRes.data) return <PostNotFound />;

  const permissions = await checkPermissionsAction(
    infoRes.data.permissions,
    user,
  );

  const configuredListSkin = normalizeSkinName(infoRes.data.config?.skin);
  const postSkinCapability = getPostSkinCapability(infoRes.data.config);
  const defaultDocumentStatus = postSkinCapability.documentStatus?.defaultStatus;
  const ResolvedSkin = Skin || postSkinRegistry.list[configuredListSkin] || DefaultListSkin;

  return (
    <PostProvider
      value={{ postInfo: infoRes.data, currentUser: user, permissions }}
    >
      <ResolvedSkin
        key={`${mid}-${page}-${category}`}
        posts={listRes.data?.documentList || []}
        status={status || defaultDocumentStatus}
        statusCounts={listRes.data?.statusCounts}
        pagination={
          listRes.data?.navigation || {
            page: 1,
            totalPages: 1,
            listCount: 0,
            totalCount: 0,
          }
        }
      />
    </PostProvider>
  );
}

/**
 * 🧩 2. 상세 본문 블록 (Post.Read)
 */
async function PostRead({
  mid,
  slug,
  Skin = DefaultReadSkin, // 👈 스킨 주입
}: {
  mid: string;
  slug: string;
  Skin?: React.ComponentType<any>;
}) {
  const [infoRes, docRes, user] = await Promise.all([
    getPostsInfoAction(mid),
    getDocumentBySlugAction(slug),
    getServerUser(),
  ]);

  if (!infoRes.success || !docRes.success || !docRes.data) return null;
  if ((docRes.data as any)._secretLocked) {
    return <SecretUnlock slug={slug} title={docRes.data.title} />;
  }

  const numericId = docRes.data.id;
  const participantsRes = await getParticipantsAction(numericId);
  const permissions = await checkPermissionsAction(
    infoRes.data.permissions,
    user,
  );
  const requestIp = (await headers()).get("x-forwarded-for") || "";
  await increaseViewCount(numericId, user?.id, requestIp);

  return (
    <Skin
      document={docRes.data}
      participants={participantsRes.data || []}
      postInfo={infoRes.data}
      permissions={permissions}
      currentUser={user}
    />
  );
}

/**
 * 🧩 3. 댓글 블록 (Post.Comments)
 */
async function PostComments({
  mid,
  slug,
  page = 1,
  Skin = DefaultCommentsSkin, // 👈 스킨 주입
}: {
  mid: string;
  slug: string;
  page?: number;
  Skin?: React.ComponentType<any>;
}) {
  const docRes = await getDocumentBySlugAction(slug);
  if (!docRes.data) return null;
  if ((docRes.data as any)._secretLocked) return null;
  const id = docRes.data.id;

  const [infoRes, user, commentsRes] = await Promise.all([
    getPostsInfoAction(mid),
    getServerUser(),
    getCommentsAction(id, page, 10),
  ]);

  if (!infoRes.success || !infoRes.data) return null;

  const permissions = await checkPermissionsAction(
    infoRes.data.permissions,
    user,
  );

  async function upsertCommentAction(data: any) {
    "use server";
    const path = `/posts/${mid}/${slug}`;
    if (data.commentId && (data.options?.remove || data.options?.deleted)) {
      return await removeCommentAction(id, data.commentId, path);
    }
    const formData = new FormData();
    if (data.commentId) formData.append("id", data.commentId.toString());
    formData.append("documentId", id.toString());
    formData.append("content", data.content);
    if (typeof data.notificationEnabled === "boolean") {
      formData.append("notificationEnabled", data.notificationEnabled ? "true" : "false");
    }
    if (data.parentId) formData.append("parentId", data.parentId.toString());
    return await saveCommentAction(formData, path);
  }

  return (
    <PostProvider
      value={{ postInfo: infoRes.data, currentUser: user, permissions }}
    >
      <CommentListStatic
        documentId={id}
        comments={commentsRes.data?.items || []}
        currentUser={user}
        canReply={permissions.doComment}
        upsertComment={upsertCommentAction as any}
      />
      <Skin
        documentId={id}
        renderList={false}
        commentsData={
          commentsRes.data || {
            items: [],
            pagination: {
              totalCount: 0,
              totalPages: 0,
              currentPage: 1,
              pageSize: 10,
            },
          }
        }
        upsertComment={upsertCommentAction as any}
        getCommentsPage={async (p: number) => {
          "use server";
          return await getCommentsAction(id, p, 10);
        }}
      />
    </PostProvider>
  );
}

/**
 * 🧩 4. 쓰기/수정 블록 (Post.Write)
 */
async function PostWrite({
  mid,
  slug,
  Skin = DefaultWriteSkin, // 👈 스킨 주입
}: {
  mid: string;
  slug?: string;
  Skin?: React.ComponentType<any>;
}) {
  const [infoRes, user] = await Promise.all([
    getPostsInfoAction(mid),
    getServerUser(),
  ]);

  console.log(mid);

  if (!infoRes.success || !infoRes.data) return null;

  const permissions = await checkPermissionsAction(
    infoRes.data.permissions,
    user,
  );

  let existingPost: any = null;
  if (slug) {
    const docRes = await getDocumentBySlugAction(slug);
    existingPost = docRes.data;
  }

  const savePostAction = async (formData: FormData) => {
    "use server";
    return await saveDocument(mid, formData, `/posts/${mid}`);
  };

  return (
    <PostProvider
      value={{ postInfo: infoRes.data, currentUser: user, permissions }}
    >
      <Skin existingPost={existingPost} savePost={savePostAction} />
    </PostProvider>
  );
}

// 🌟 최종 조립 객체
export const Post = {
  List: PostList,
  Read: PostRead,
  Comments: PostComments,
  Write: PostWrite,
};
