"use client";

import DashboardPostCategories from "@/modules/posts/admin/categories";
import { useParams } from "next/navigation";

const Page = () => {
  const params = useParams();
  const id = params?.id as string;

  return (
    <>
      <DashboardPostCategories moduleId={id} />
    </>
  );
};

export default Page;
