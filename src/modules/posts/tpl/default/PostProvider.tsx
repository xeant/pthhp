"use client";

import React, { createContext, useContext, ReactNode } from "react";

interface PostContextValue {
  postInfo: any;
  currentUser: any;
  permissions: {
    doList: boolean;
    doRead: boolean;
    doWrite: boolean;
    doComment: boolean;
  };
}

const PostContext = createContext<PostContextValue | undefined>(undefined);

const PostProvider = ({ children, value }: { children: ReactNode; value: PostContextValue }) => {
  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
};

export const usePostContext = () => {
  const context = useContext(PostContext);
  if (!context) throw new Error("usePostContext must be used within a PostProvider");
  return context;
};

export default PostProvider;