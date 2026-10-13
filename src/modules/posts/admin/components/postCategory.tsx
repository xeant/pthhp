"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const PostCategory = ({ postId }: { postId: string }) => {
  const pathname = usePathname();
  const links = [
    { href: `/admin/posts/${postId}/update`, label: "게시판 정보" },
    { href: `/admin/posts/${postId}/categories`, label: "카테고리" },
    { href: `/admin/posts/${postId}/extraField`, label: "확장필드" },
  ];

  return (
    <>
      <div className={`flex justify-center`}>
        <div className={`flex bg-gray-100 rounded-md p-1 gap-1`}>
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1 rounded-md ${
                  isActive
                    ? "bg-white text-gray-950 text-sm"
                    : "text-gray-700 hover:bg-gray-200 text-sm"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};
export default PostCategory;
