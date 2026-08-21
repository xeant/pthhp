// src/app/(extentions)/posts/(views)/[mid]/[id]/edit/page.tsx

import React from "react";
import { Post } from "@/modules/posts";

const Page = async ({ params }: { params: Promise<{ mid: string; slug: string }> }) => {
  const { mid, slug } = await params;

  return (
    <div className="max-w-screen-lg mx-auto px-3">
      {/* 🌟 [딱 한 줄 조립]
          기존 글 가져오기, 권한 체크, 저장 액션 연결까지 Post.Write가 다 합니다.
      */}
      <Post.Write mid={mid} slug={slug} />
    </div>
  );
};

export default Page;