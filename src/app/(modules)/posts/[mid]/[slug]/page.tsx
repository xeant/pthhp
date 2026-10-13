
import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { Post } from "@/modules/posts"; // 🌟 스마트 블록
import { getPostReadMetadata } from "@/modules/posts/actions/seo.action";
import Loading from "@/app/loading";

interface PageProps {
  params: Promise<{ mid: string; slug: string }>;
  searchParams?: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: any) {
  const { slug, mid } = await params;
  return await getPostReadMetadata(slug, mid); // 👈 한 줄 컷!
}

const Page = async ({ params, searchParams }: PageProps) => {
  const resolvedParams = await params;

  const { mid, slug } = await params;
  const { page } = (await searchParams) || {};
  const docId = slug;

  // 1. 작성/예외 페이지 처리
  if (slug === "create" || slug === "undefined") redirect(`/posts/${mid}/create`);

  return (
    <div className="max-w-screen-xl mx-auto">
      <Suspense fallback={<Loading />}>
        <Post.Read mid={mid} slug={docId} />
      </Suspense>

      <Suspense fallback={<Loading />}>
        <Post.Comments
          mid={mid}
          slug={docId}
          page={Number(page || 1)}
        />
      </Suspense>
    </div>
  );
};

export default Page;
