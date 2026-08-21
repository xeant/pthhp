"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Download, Eye, File, FileText, Flag, MessageSquareText, Paperclip, Trash2 } from "lucide-react";

import Button from "@/core/components/button/Button";
import PageNavigation from "@/core/components/nav/PageNavigation";
import {
  removeAttachmentAdminAction,
  removeCommentAdminAction,
  removeDocumentAdminAction,
} from "@/modules/admin/actions/content.action";
import type {
  AdminAttachmentListData,
  AdminCommentListData,
  AdminDocumentListData,
} from "@/modules/admin/actions/content.action";

type ContentSection = "overview" | "documents" | "comments" | "attachments" | "reports";

interface ContentAdminProps {
  section?: ContentSection;
  initialDocuments?: AdminDocumentListData["items"];
  initialComments?: AdminCommentListData["items"];
  initialAttachments?: AdminAttachmentListData["items"];
  navigation?: AdminDocumentListData["navigation"];
}

const sectionMeta: Record<ContentSection, {
  eyebrow: string;
  title: string;
  description: string;
}> = {
  overview: {
    eyebrow: "Content",
    title: "콘텐츠 관리",
    description: "게시글, 댓글, 첨부파일, 신고를 한 곳에서 운영하기 위한 관리 영역입니다.",
  },
  documents: {
    eyebrow: "Documents",
    title: "전체 게시글",
    description: "모든 게시판의 게시글을 통합 조회하고 상태, 작성자, 게시판 기준으로 관리합니다.",
  },
  comments: {
    eyebrow: "Comments",
    title: "댓글 관리",
    description: "전체 댓글과 답글을 통합 조회하고 삭제, 복구, 작성자 기준 확인을 처리합니다.",
  },
  attachments: {
    eyebrow: "Attachments",
    title: "첨부파일 관리",
    description: "회원별 업로드 파일, 이미지 사용 여부, 용량 현황을 확인합니다.",
  },
  reports: {
    eyebrow: "Reports",
    title: "신고 관리",
    description: "사용자 신고를 접수, 검토, 처리 상태별로 관리합니다.",
  },
};

const contentCards = [
  {
    href: "/admin/content/documents",
    icon: <FileText size={17} />,
    title: "전체 게시글",
    desc: "게시판 구분 없이 게시글을 운영 기준으로 조회합니다.",
  },
  {
    href: "/admin/content/comments",
    icon: <MessageSquareText size={17} />,
    title: "댓글 관리",
    desc: "댓글과 답글을 통합 조회하고 관리합니다.",
  },
  {
    href: "/admin/content/attachments",
    icon: <Paperclip size={17} />,
    title: "첨부파일 관리",
    desc: "업로드 파일과 이미지 사용 현황을 확인합니다.",
  },
  {
    href: "/admin/content/reports",
    icon: <Flag size={17} />,
    title: "신고 관리",
    desc: "신고 접수와 처리 상태를 관리합니다.",
  },
];

const defaultNavigation = {
  totalCount: 0,
  totalPages: 0,
  page: 1,
  listCount: 0,
};

const formatDate = (date: Date | string) => {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

const formatFileSize = (bytes: number) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, index);

  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
};

const ContentAdmin = ({
  section = "overview",
  initialDocuments = [],
  initialComments = [],
  initialAttachments = [],
  navigation = defaultNavigation,
}: ContentAdminProps) => {
  const meta = sectionMeta[section];
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = (
    type: "document" | "comment" | "attachment",
    id: number,
    label: string,
  ) => {
    const messages = {
      document: "게시글을 삭제하면 연결된 댓글도 함께 삭제될 수 있습니다.",
      comment: "댓글을 삭제하시겠습니까?",
      attachment: "첨부파일을 삭제하면 실제 파일도 함께 삭제됩니다.",
    };

    if (!window.confirm(`${label}\n${messages[type]}`)) return;

    startTransition(async () => {
      const result = type === "document"
        ? await removeDocumentAdminAction(id)
        : type === "comment"
          ? await removeCommentAdminAction(id)
          : await removeAttachmentAdminAction(id);

      if (!result.success) {
        window.alert(result.message || "삭제에 실패했습니다.");
        return;
      }

      router.refresh();
    });
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-3 py-8 md:px-5 md:py-10 dark:text-dark-100">
      <div className="mb-8">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{meta.eyebrow}</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-dark-100">{meta.title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">{meta.description}</p>
      </div>

      {section === "overview" ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {contentCards.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-md border border-gray-200 bg-white p-5 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-dark-800 dark:bg-dark-900 dark:hover:border-dark-700 dark:hover:bg-dark-800"
            >
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-md bg-gray-950 text-white dark:bg-cyan-500 dark:text-dark-950">
                {item.icon}
              </div>
              <div className="text-sm font-semibold text-gray-900 dark:text-dark-100">{item.title}</div>
              <p className="mt-2 text-sm leading-6 text-gray-500">{item.desc}</p>
            </Link>
          ))}
        </div>
      ) : section === "documents" ? (
        <div>
          <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="text-sm text-gray-400">
              전체 {navigation.totalCount}개 중 최근 {initialDocuments.length}개를 표시하고 있습니다.
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-gray-100 bg-white shadow-sm shadow-gray-100 dark:border-dark-800 dark:bg-dark-900 dark:shadow-black/20">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80 dark:border-dark-800 dark:bg-dark-950/70">
                    <th className="w-16 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">ID</th>
                    <th className="w-36 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">Board</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">Document</th>
                    <th className="w-32 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">Author</th>
                    <th className="w-28 px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">Stats</th>
                    <th className="w-28 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</th>
                    <th className="w-32 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">Created</th>
                    <th className="w-20 px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">View</th>
                    <th className="w-24 px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {initialDocuments.length > 0 ? (
                    initialDocuments.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100 transition-colors last:border-b-0 hover:bg-blue-50/40 dark:border-dark-800 dark:hover:bg-white/[0.04]">
                        <td className="px-4 py-4 text-sm font-medium text-gray-400">{item.id}</td>
                        <td className="px-4 py-4">
                          <div className="inline-flex rounded-md bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600 dark:bg-dark-800 dark:text-dark-300">
                            {item.module.mid}
                          </div>
                          <div className="mt-1 truncate text-xs text-gray-400">{item.module.moduleName}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex min-w-0 flex-col">
                            <Link
                              href={`/posts/${item.module.mid}/${item.slug}`}
                              className="line-clamp-1 text-sm font-semibold text-gray-800 transition-colors hover:text-blue-600 dark:text-dark-100 dark:hover:text-cyan-400"
                            >
                              {item.title}
                            </Link>
                            <div className="mt-1 line-clamp-1 text-xs text-gray-400">
                              {item.preview || "본문 미리보기가 없습니다."}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {item.category?.title && (
                                <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 dark:bg-dark-800 dark:text-dark-300">
                                  {item.category.title}
                                </span>
                              )}
                              {item.isNotice && (
                                <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-500">공지</span>
                              )}
                              {item.isSecrets && (
                                <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">비밀글</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {item.user?.nickName || item.user?.accountId || "비회원"}
                        </td>
                        <td className="px-4 py-4 text-center text-xs text-gray-500">
                          <div>조회 {item.readCount || 0}</div>
                          <div className="mt-1">댓글 {item.commentCount || 0}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-600 dark:text-dark-300">{item.status || "public"}</div>
                          <div className="mt-1 text-xs text-gray-400">{item.published ? "published" : "draft"}</div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">{formatDate(item.createdAt)}</td>
                        <td className="px-4 py-4 text-center">
                          <Link
                            href={`/posts/${item.module.mid}/${item.slug}`}
                            className="inline-flex items-center justify-center rounded-md bg-gray-100 p-2 text-gray-500 transition-colors hover:bg-gray-900 hover:text-white dark:bg-dark-800 dark:text-dark-300 dark:hover:bg-cyan-500 dark:hover:text-dark-950"
                            aria-label={`${item.title} 보기`}
                          >
                            <Eye size={14} />
                          </Link>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Button
                            type="button"
                            icon={<Trash2 size={14} />}
                            disabled={isPending}
                            className="h-8 bg-red-50 px-3 text-red-500 hover:bg-red-500 hover:text-white"
                            onClick={() => handleDelete("document", item.id, `"${item.title}" 게시글을 삭제합니다.`)}
                          >
                            삭제
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-16 text-center text-sm text-gray-400">조회된 게시글이 없습니다.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {navigation.totalPages > 0 && (
            <div className="mt-6 flex justify-center">
              <PageNavigation page={navigation.page} totalPages={navigation.totalPages} basePath="/admin/content/documents" />
            </div>
          )}
        </div>
      ) : section === "comments" ? (
        <div>
          <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="text-sm text-gray-400">
              전체 {navigation.totalCount}개 중 최근 {initialComments.length}개를 표시하고 있습니다.
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-gray-100 bg-white shadow-sm shadow-gray-100 dark:border-dark-800 dark:bg-dark-900 dark:shadow-black/20">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80 dark:border-dark-800 dark:bg-dark-950/70">
                    <th className="w-16 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">ID</th>
                    <th className="w-36 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">Board</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">Comment</th>
                    <th className="w-52 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">Document</th>
                    <th className="w-32 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">Author</th>
                    <th className="w-28 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</th>
                    <th className="w-32 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">Created</th>
                    <th className="w-20 px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">View</th>
                    <th className="w-24 px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {initialComments.length > 0 ? (
                    initialComments.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100 transition-colors last:border-b-0 hover:bg-blue-50/40 dark:border-dark-800 dark:hover:bg-white/[0.04]">
                        <td className="px-4 py-4 text-sm font-medium text-gray-400">{item.id}</td>
                        <td className="px-4 py-4">
                          <div className="inline-flex rounded-md bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600 dark:bg-dark-800 dark:text-dark-300">
                            {item.document.module.mid}
                          </div>
                          <div className="mt-1 truncate text-xs text-gray-400">{item.document.module.moduleName}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="line-clamp-2 text-sm font-medium leading-6 text-gray-700 dark:text-dark-200">
                            {item.content}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {item.depth > 0 && (
                              <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 dark:bg-dark-800 dark:text-dark-300">
                                답글
                              </span>
                            )}
                            {item.isSecret && (
                              <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">비밀댓글</span>
                            )}
                            {item.isDeleted && (
                              <span className="rounded bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-500">삭제됨</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Link
                            href={`/posts/${item.document.module.mid}/${item.document.slug}`}
                            className="line-clamp-2 text-sm font-semibold text-gray-800 transition-colors hover:text-blue-600 dark:text-dark-100 dark:hover:text-cyan-400"
                          >
                            {item.document.title || "제목 없음"}
                          </Link>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {item.user?.nickName || item.user?.accountId || "비회원"}
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-600 dark:text-dark-300">{item.status || "normal"}</div>
                          <div className="mt-1 text-xs text-gray-400">{item.parentId ? "reply" : "root"}</div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">{formatDate(item.createdAt)}</td>
                        <td className="px-4 py-4 text-center">
                          <Link
                            href={`/posts/${item.document.module.mid}/${item.document.slug}`}
                            className="inline-flex items-center justify-center rounded-md bg-gray-100 p-2 text-gray-500 transition-colors hover:bg-gray-900 hover:text-white dark:bg-dark-800 dark:text-dark-300 dark:hover:bg-cyan-500 dark:hover:text-dark-950"
                            aria-label={`${item.document.title || "게시글"} 보기`}
                          >
                            <Eye size={14} />
                          </Link>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Button
                            type="button"
                            icon={<Trash2 size={14} />}
                            disabled={isPending}
                            className="h-8 bg-red-50 px-3 text-red-500 hover:bg-red-500 hover:text-white"
                            onClick={() => handleDelete("comment", item.id, `#${item.id} 댓글을 삭제합니다.`)}
                          >
                            삭제
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-16 text-center text-sm text-gray-400">조회된 댓글이 없습니다.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {navigation.totalPages > 0 && (
            <div className="mt-6 flex justify-center">
              <PageNavigation page={navigation.page} totalPages={navigation.totalPages} basePath="/admin/content/comments" />
            </div>
          )}
        </div>
      ) : section === "attachments" ? (
        <div>
          <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="text-sm text-gray-400">
              전체 {navigation.totalCount}개 중 최근 {initialAttachments.length}개를 표시하고 있습니다.
            </div>
          </div>

          {initialAttachments.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {initialAttachments.map((item) => {
                const isImage = item.mimeType.startsWith("image/");

                return (
                  <div
                    key={item.id}
                    className="group overflow-hidden rounded-md border border-gray-100 bg-white shadow-sm shadow-gray-100 transition-colors hover:border-gray-200 hover:bg-gray-50 dark:border-dark-800 dark:bg-dark-900 dark:shadow-black/20 dark:hover:border-dark-700 dark:hover:bg-dark-800"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-dark-950">
                      {isImage ? (
                        <img
                          src={item.path}
                          alt={item.originalName}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center text-gray-400">
                          <File size={36} strokeWidth={1.5} />
                          <div className="mt-3 max-w-[80%] truncate text-xs font-semibold">{item.mimeType}</div>
                        </div>
                      )}

                      <div className="absolute left-3 top-3 rounded bg-white/90 px-2 py-1 text-[10px] font-bold text-gray-500 shadow-sm dark:bg-dark-950/85 dark:text-dark-300">
                        #{item.id}
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="line-clamp-1 text-sm font-semibold text-gray-800 dark:text-dark-100">{item.originalName}</div>
                      <div className="mt-1 line-clamp-1 text-xs text-gray-400">{item.fileName}</div>

                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-500">
                        <div>
                          <div className="font-semibold text-gray-700 dark:text-dark-200">{formatFileSize(item.size)}</div>
                          <div className="mt-0.5 text-gray-400">용량</div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-700 dark:text-dark-200">{item.uploadedBy?.nickName || item.uploadedBy?.accountId || "알 수 없음"}</div>
                          <div className="mt-0.5 text-gray-400">업로더</div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-3 dark:border-dark-800">
                        <div className="text-xs text-gray-400">{formatDate(item.createdAt)}</div>
                        <div className="flex items-center gap-1">
                          <a
                            href={item.path}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 text-gray-500 transition-colors hover:bg-gray-900 hover:text-white dark:bg-dark-800 dark:text-dark-300 dark:hover:bg-cyan-500 dark:hover:text-dark-950"
                            aria-label={`${item.originalName} 열기`}
                          >
                            <Eye size={14} />
                          </a>
                          <a
                            href={item.path}
                            download={item.originalName}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 text-gray-500 transition-colors hover:bg-gray-900 hover:text-white dark:bg-dark-800 dark:text-dark-300 dark:hover:bg-cyan-500 dark:hover:text-dark-950"
                            aria-label={`${item.originalName} 다운로드`}
                          >
                            <Download size={14} />
                          </a>
                          <Button
                            type="button"
                            icon={<Trash2 size={14} />}
                            disabled={isPending}
                            className="h-8 w-8 bg-red-50 px-0 text-red-500 hover:bg-red-500 hover:text-white"
                            aria-label={`${item.originalName} 삭제`}
                            onClick={() => handleDelete("attachment", item.id, `"${item.originalName}" 첨부파일을 삭제합니다.`)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-400 dark:border-dark-700 dark:bg-dark-900">
              조회된 첨부파일이 없습니다.
            </div>
          )}

          {navigation.totalPages > 0 && (
            <div className="mt-6 flex justify-center">
              <PageNavigation page={navigation.page} totalPages={navigation.totalPages} basePath="/admin/content/attachments" />
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-gray-300 bg-white p-8 dark:border-dark-700 dark:bg-dark-900">
          <div className="text-sm font-semibold text-gray-900 dark:text-dark-100">관리 리스트 준비 중</div>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            이 화면은 콘텐츠 운영용 라우트와 사이드 메뉴를 먼저 잡아둔 상태입니다. 다음 단계에서 검색, 필터, 목록,
            일괄 처리 액션을 붙이면 됩니다.
          </p>
        </div>
      )}
    </div>
  );
};

export default ContentAdmin;
