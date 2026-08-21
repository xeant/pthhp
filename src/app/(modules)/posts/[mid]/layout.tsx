// src/app/(extentions)/posts/(views)/[pid]/layout.tsx

import React from "react";
import { getPostsInfoAction } from "@/modules/posts/actions/posts.action";
import PostNotFound from "@/modules/posts/tpl/default/notFound";
import DefaultPostLayout from "@/modules/posts/tpl/default/layout";
import { normalizeLayoutName, postLayoutRegistry } from "@/modules/posts/tpl/skinRegistry";

export default async function PageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ mid: string }>;
}) {
  const { mid } = await params;
  const postInfo = await getPostsInfoAction(mid);

  if (!postInfo.success || !postInfo.data) return <PostNotFound />;

  const layoutKey = normalizeLayoutName(postInfo.data.config?.layout) || "default";
  const PostLayout = postLayoutRegistry[layoutKey] || DefaultPostLayout;

  return <PostLayout postInfo={postInfo.data}>{children}</PostLayout>;
}
