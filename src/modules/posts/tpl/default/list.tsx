"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PostsHeader from "./header";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { usePostContext } from "./PostProvider";
import "dayjs/locale/ko";

// 💡 1. 쓸모없어진 getPostsAction 대신 우리의 새 매니저를 불러옵니다!
import { getDocumentList } from "@/modules/document/actions/document.action";

dayjs.extend(relativeTime);
dayjs.locale("ko");

import PageNavigation from "@components/nav/PageNavigation";
import Button from "@components/button/Button";
import PostNotPermission from "@/modules/posts/tpl/default/notPermission";

// 💡 2. 새 Action의 응답 규격(navigation)에 맞춰 인터페이스를 통일합니다!
interface Pagination {
  page: number;
  totalPages: number;
  listCount: number;
  totalCount: number;
}

const PostsListClient = ({
  posts,
  pagination: initialPagination,
}: {
  posts: any[];
  pagination: Pagination;
}) => {
  const router = useRouter();
  const [documentInfo, setDocumentInfo] = useState(posts);
  const [pagination, setPagination] = useState(initialPagination);
  const [page, setPage] = useState(pagination.page); // 💡 currentPage 대신 page 사용
  const { postInfo, permissions } = usePostContext();

  useEffect(() => {
    setDocumentInfo(posts);
    setPagination(initialPagination);
    setPage(initialPagination.page);
  }, [posts, initialPagination]);

  if (!permissions.doList) {
    return <PostNotPermission />;
  }

  // 🌟 3. 페이지 변경 핸들러 (ActionState 포장지 뜯기 적용)
  const handlePageChange = async (newPage: number) => {
    setPage(newPage);

    // 새 매니저(Action)에게 요청! (한 페이지에 몇 개씩 보여줄지 10개로 고정하거나 기존 상태 사용)
    const res = await getDocumentList(postInfo.mid, newPage, 10);
    // 포장지 뜯고 상태 업데이트
    if (res.success && res.data) {
      setDocumentInfo(res.data.documentList);
      setPagination(res.data.navigation);
    }

    // URL 업데이트
    router.replace(`/posts/${postInfo.pid}?page=${newPage}`, { scroll: false });
  };

  console.log(posts);

  return (
    <>
      <PostsHeader />
      <div className=" mb-6">
        {documentInfo.map((doc) => (
          <div
            key={doc.id}
            className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-dark-800 dark:hover:bg-dark-900/70"
          >
            <div className="flex gap-4 flex-1 px-3 py-4 lg:py-8">
              <div className="relative shrink-0 w-[80px] h-[80px] rounded-md overflow-hidden bg-gray-100 flex items-center justify-center dark:bg-dark-900 dark:ring-1 dark:ring-dark-800">
                {doc.thumbnail ? (
                  <Image
                    src={doc.thumbnail}
                    alt={doc.title || "썸네일"}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full text-[12px] text-gray-400"
                  />
                ) : (
                  <span className="text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                      />
                    </svg>
                  </span>
                )}
              </div>
              <div className="flex items-center flex-1 flex-wrap gap-4">
                <Link
                  href={`/posts/${postInfo.mid}/${doc.slug}`}
                  className="w-full lg:flex-1"
                >
                  <div>
                    <div className="flex items-center gap-2 text-sm lg:text-base font-semibold text-gray-950 dark:text-white line-clamp-2 mb-2">
                      {doc.title}
                      {doc.thumbnail && (
                        <span className="text-gray-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.25}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                            />
                          </svg>
                        </span>
                      )}
                    </div>
                    <div
                      className={`mb-4 text-sm wrap-break-word break-keep text-gray-500 dark:text-gray-300 line-clamp-2`}
                    >
                      {doc.content}
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.category && (
                        <div className="relative text-gray-900 text-xs before:bg-gray-300 dark:text-dark-300 dark:before:bg-dark-700">
                          {doc.category.title}
                        </div>
                      )}
                      <div className="relative flex items-center gap-1.5 text-gray-900 dark:text-dark-100 text-xs before:bg-gray-300 dark:before:bg-dark-700">
                        <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-[10px] font-semibold text-gray-400 dark:bg-dark-800 dark:text-dark-300">
                          {doc.user?.profile?.profileImage ? (
                            <img
                              src={doc.user.profile.profileImage}
                              alt={doc.user?.nickName || "작성자"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            doc.user?.nickName?.slice(0, 1).toUpperCase() || "작"
                          )}
                        </span>
                        <span>{doc.user?.nickName || "작성자"}</span>
                      </div>
                      <div className="relative text-gray-400 text-xs before:bg-gray-300">
                        {dayjs(doc.createdAt).fromNow()}
                      </div>
                      <div className="relative flex gap-2 before:bg-gray-300 dark:before:bg-dark-700">
                        <div className="text-xs text-gray-400">댓글</div>
                        <div className="text-xs text-gray-700 dark:text-dark-300">
                          {doc.commentCount}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="text-xs text-gray-400">조회수</div>
                        <div className="text-xs text-gray-700 dark:text-dark-300">
                          {doc.readCount}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* 우측 댓글 알림 영역 등 (기존 하드코딩된 부분 유지) */}
                <div className="flex items-center w-full lg:w-1/4">
                  {doc.latestComment ? (
                    <div className="flex-1 py-2 rounded-md ">
                      <div className="flex items-center gap-4 lg:block pl-0 lg:px-4 lg:border-l border-gray-200 dark:border-dark-800">
                        <div className="flex items-center gap-2 mb-0 lg:mb-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-4 text-gray-400"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                            />
                          </svg>
                          <div className="!text-[12px] lg:text-sm text-gray-600 dark:text-dark-100 line-clamp-1">
                            <span className="inline-flex items-center gap-1.5">
                              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-[10px] font-semibold text-gray-400 dark:bg-dark-800 dark:text-dark-300">
                                {doc.latestComment?.user?.profile?.profileImage ? (
                                  <img
                                    src={doc.latestComment.user.profile.profileImage}
                                    alt={doc.latestComment?.user?.nickName || "익명"}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  doc.latestComment?.user?.nickName?.slice(0, 1).toUpperCase() || "익"
                                )}
                              </span>
                              {doc.latestComment?.user?.nickName || "익명"}
                            </span>
                          </div>
                          <div className="text-gray-400 !text-[12px]">
                            {dayjs(doc.latestComment?.createdAt).fromNow()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 !text-[12px] text-gray-500 dark:text-dark-400">
                          {doc.latestComment.image && (
                            <Image
                              src={doc.latestComment.image}
                              alt="댓글 이미지"
                              width={20}
                              height={20}
                              className="h-5 w-5 shrink-0 rounded object-cover"
                            />
                          )}
                          <span className="line-clamp-1">
                            {doc.latestComment.content}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* 댓글이 없을 때 보여줄 빈 상태 (선택 사항) */
                    <div className="hidden lg:flex flex-1 items-center justify-center py-2 px-4 border-l border-gray-100 italic text-[12px] text-gray-400 dark:border-dark-800 dark:text-dark-500">
                      아직 댓글이 없습니다.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-4">
        <div className="">
          {/* 💡 Link로 감싸서 이동 기능을 주고, Button으로 디자인과 애니메이션을 담당합니다. */}
          <Link href={`/posts/${postInfo.mid}/create`}>
            <Button type="button" className="px-8">
              글쓰기
            </Button>
          </Link>
        </div>
      </div>
      <div className="pt-10 pb-20">
        <div className="">
          <div className="flex justify-between gap-4 flex-wrap">
            <div className="w-full flex justify-center">
              <PageNavigation
                page={page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PostsListClient;
