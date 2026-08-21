import React, { Suspense } from "react";
import { Post } from "@/modules/posts"; // 🌟 우리가 만든 스마트 블록 가져오기
import { getPostListMetadata } from "@modules/posts/actions/seo.action";
import Loading from "@/app/loading";

// 📌 1. 메타데이터 생성 (여기는 데이터를 읽어야 하니 기존 로직 유지)

export async function generateMetadata({params}: any) {
  const {mid} = await params;
  return await getPostListMetadata(mid); // 👈 한 줄 컷!
}


// 📌 2. 페이지 컴포넌트 (세상에서 제일 깔끔!)
const Page = async ({ params, searchParams }: {
  params: Promise<{ mid: string }>;
  searchParams?: Promise<{ page?: string; category?: string; status?: string }>;
}) => {
  const { mid } = await params;
  const { page, category, status } = (await searchParams) || {};

  return (
    <div className="max-w-screen-lg mx-auto px-3">
      {/* 🌟 [핵심] 이제 복잡한 로직은 Post.List 블록이 다 알아서 합니다.
         우리는 그냥 레고 블록 끼우듯이 한 줄만 딱!
      */}
      <Suspense fallback={<Loading />}>
        <Post.List
          mid={mid}
          page={Number(page || 1)}
          limit={10}
          category={category}
          status={status}
        />
      </Suspense>
    </div>
  );
};

export default Page;
