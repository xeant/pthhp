import React from "react";

const DefaultPostLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className="posts-container w-full">{children}</div>;
};

export default DefaultPostLayout;
