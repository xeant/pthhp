"use client"

import {usePostContext} from "./PostProvider";
import PostsCategories from "@/modules/posts/tpl/default/category";

const PostsHeader = () => {
  const { postInfo } = usePostContext();

  return (
    <>
      <div className="">
        <div className="text-3xl text-center font-semibold dark:text-white py-10">
          {postInfo.moduleName}
        </div>
        <div className="">
          <PostsCategories />
        </div>
      </div>
    </>
  );
};

export default PostsHeader;
