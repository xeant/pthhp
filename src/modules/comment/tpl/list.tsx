"use client";

import React, { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";
import { useRouter } from "next/navigation";
import Modal from "@components/modal/Modal";
import Button from "@components/button/Button";
import { usePostContext } from "@/modules/posts/tpl/default/PostProvider";
import { CommentWithChildren } from "@/modules/comment/actions/_type";
import TiptapEditor from "@components/editor/tiptap/tiptapEditor";
import { Attachment } from "@/modules/attachment";
import type { Attachment as IAttachment } from "@/modules/attachment/actions/_type";

dayjs.extend(relativeTime);
dayjs.locale("ko");

interface UpsertCommentArgs {
  documentId: number;
  content: string;
  parentId?: number;
  commentId?: number;
  notificationEnabled?: boolean;
  options?: { deleted?: boolean; remove?: boolean };
}

// 🌟 서버 액션의 리턴 타입과 일치시킵니다.
interface UpsertResponse {
  success: boolean;
  item?: CommentWithChildren;
  data?: CommentWithChildren;
  message?: string;
  actionType: 'CREATE' | 'UPDATE' | 'DELETE';
}

interface CommentsListProps {
  documentId: number;
  commentsData: {
    items: CommentWithChildren[];
    pagination: { totalPages: number; totalCount: number; currentPage: number; pageSize: number };
  };
  renderList?: boolean;
  // Page.tsx에서 넘겨주는 함수의 모양과 똑같이 맞춤
  upsertComment: (args: {
    documentId: number;
    content: string;
    parentId?: number;
    commentId?: number;
    notificationEnabled?: boolean;
    options?: { deleted?: boolean; remove?: boolean };
  }) => Promise<UpsertResponse>;

  getCommentsPage: (page: number) => Promise<any>;
}

interface ParentComment {
  id: number;
  nickName: string | null | undefined;
  content: string;
  createdAt: string;
}

export default function CommentsList({
                                       documentId,
                                       commentsData,
                                       renderList = true,
                                       upsertComment,
                                       getCommentsPage,
                                     }: CommentsListProps) {
  const router = useRouter();
  const { currentUser } = usePostContext();
  const editorRef = useRef<any>(null);
  const [comments, setComments] = useState(commentsData);
  const [page, setPage] = useState(commentsData.pagination.currentPage);
  const [modalContent, setModalContent] = useState("");
  const [newContent, setNewContent] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentTarget, setCurrentTarget] = useState<CommentWithChildren | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalParent, setModalParent] = useState<ParentComment | null>(null);
  const [commentsState, setCommentsState] = useState(commentsData);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [newNotificationEnabled, setNewNotificationEnabled] = useState(true);
  const [modalNotificationEnabled, setModalNotificationEnabled] = useState(true);
  const { permissions } = usePostContext();

  // props로 넘어온 데이터가 변경되면 내부 상태도 동기화
  useEffect(() => {
    setComments(commentsData);
  }, [commentsData]);

  useEffect(() => {
    if (!isComposerOpen) return;
    const timer = window.setTimeout(() => {
      editorRef.current?.commands?.focus?.();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isComposerOpen]);

  if (!permissions.doRead) {
    return "";
  }

  /** ====== 댓글 트리 구조 유지 ====== */
  const mergeComments = (
    prevItems: CommentWithChildren[] = [],
    newItems: CommentWithChildren[] = []
  ): CommentWithChildren[] => {
    const commentMap = new Map<number, CommentWithChildren>();

    const flatten = (items: CommentWithChildren[]) => {
      if (!items || !Array.isArray(items)) return;
      items.forEach(item => {
        commentMap.set(item.id, { ...item, children: [] });
        if (item.children?.length) flatten(item.children);
      });
    };
    flatten(prevItems);
    flatten(newItems);

    const roots: CommentWithChildren[] = [];
    commentMap.forEach(comment => {
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(comment);
        } else {
          roots.push(comment);
        }
      } else {
        roots.push(comment);
      }
    });

    return roots;
  };



  /** ====== 댓글 자동 스크롤 + 하이라이트 ====== */
  const highlightComment = (commentId: number) => {
    setTimeout(() => {
      const el = document.getElementById(`comment-${commentId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("bg-yellow-100");
        setTimeout(() => el.classList.remove("bg-yellow-100"), 2000);
      }
    }, 100); // 렌더링 후
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editorRef.current || editorRef.current.isEmpty) return;

    setLoading(true);
    try {
      const jsonContent = editorRef.current.getJSON();
      const result = await upsertComment({ documentId, content: JSON.stringify(jsonContent), notificationEnabled: newNotificationEnabled });

      // 🌟 result.item 혹은 (result as any).data 둘 다 확인하도록 수정
      const newComment = result.item || (result as any).data;

      if (result.success && newComment) {
        setComments(prev => ({
          ...prev,
          items: [newComment, ...prev.items],
          pagination: {
            ...prev.pagination,
            totalCount: prev.pagination.totalCount + 1
          }
        }));

        highlightComment(newComment.id);

        // ✅ 여기서 확실하게 비워줍니다!
        setNewContent("");
        setNewNotificationEnabled(true);
        setIsComposerOpen(false);
        editorRef.current.commands.clearContent();
        router.refresh();
      } else {
        // 실패 시 에러 메시지라도 띄워보면 디버깅이 쉽습니다.
        alert(result.message || "댓글 등록에 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileDelete = (file: IAttachment) => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.commands.command(({ tr, state }) => {
      const { doc } = state;
      const posToDelete: number[] = [];

      doc.descendants((node, pos) => {
        if (node.type.name === "image" && node.attrs.src === file.path) {
          posToDelete.push(pos);
        }
      });

      posToDelete.reverse().forEach((pos) => {
        tr.delete(pos, pos + 1);
      });

      return true;
    });

    setNewContent(editor.getHTML());
  };

  /** ====== 답글/수정 ====== */
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalContent.trim() || !currentTarget) return;

    setLoading(true);
    try {
      const result = await upsertComment({
        documentId,
        content: modalContent,
        parentId: isEditMode ? undefined : currentTarget?.id,
        commentId: isEditMode ? currentTarget?.id : undefined,
        notificationEnabled: isEditMode ? undefined : modalNotificationEnabled,
      });

      // 🌟 여기도 마찬가지로 데이터 키값 확인
      const updatedItem = result.item || (result as any).data;

      if (result.success && updatedItem) {
        if (result.actionType === 'CREATE') {
          setComments(prev => ({
            ...prev,
            items: mergeComments(prev.items, [updatedItem]),
            pagination: { ...prev.pagination, totalCount: prev.pagination.totalCount + 1 }
          }));
          highlightComment(updatedItem.id);
        } else {
          setComments(prev => ({
            ...prev,
            items: prev.items.map(it => it.id === updatedItem.id ? updatedItem : it)
          }));
        }

        // ✅ [해결] 성공 시 무조건 모달 닫고 내용 비우기
        setShowModal(false);
        setModalContent("");
        router.refresh();
      } else {
        alert(result.message || "저장에 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (comment: CommentWithChildren) => {
    if (!confirm("삭제하시겠습니까?")) return;
    setLoading(true);

    try {
      const res = await upsertComment({
        documentId,
        content: "",
        commentId: comment.id,
        options: {
          deleted: !!(comment.children && comment.children.length > 0),
          remove: !(comment.children && comment.children.length > 0)
        }
      });

      if (res.success) {
        // ✅ 삭제 후 현재 페이지 목록을 다시 가져옴
        const updatedRes = await getCommentsPage(page);

        // ✅ 중요: ActionState 포장지에서 data({ items, pagination })만 쏙 꺼내서 전달
        if (updatedRes.success && updatedRes.data) {
          setComments(updatedRes.data);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const openReplyModal = (comment: CommentWithChildren) => {
    setCurrentTarget(comment);
    setModalContent("");
    setModalNotificationEnabled(true);
    setIsEditMode(false);
    setShowModal(true);

    const parent: ParentComment = {
      id: comment.id,
      nickName: comment.userName,
      content: comment.content,
      // 🌟 Date 객체를 string으로 변환 (dayjs 활용)
      createdAt: dayjs(comment.createdAt).toISOString(),
    };
    setModalParent(parent);
  };
  const openEditModal = (comment: CommentWithChildren) => {
    setCurrentTarget(comment);
    setModalContent(comment.content);
    setModalNotificationEnabled(true);
    setIsEditMode(true);
    setShowModal(true);
  };

  /** ====== 댓글 렌더링 ====== */
  const renderComments = (comments: CommentWithChildren[], depth = 0, parentUserName?: string): React.ReactNode => {
    return comments.map((c, index) => {
      const isLast = index === comments.length - 1;

      return (
        <div
          key={`${c.id}-${c.uuid}`}
          id={`comment-${c.id}`}
          className="relative"
        >
          {/* 🧶 [기둥 선] 자식이 있을 때만 아바타 아래로 길게 내림 (중복 방지를 위해 부모만 담당) */}
          {c.children && c.children.length > 0 && (
	            <div className="absolute left-[19px] top-10 bottom-0 z-0 w-[1px] bg-gray-100 dark:bg-dark-800" />
          )}

          <div className={`relative flex items-start ${depth > 0 ? "ml-10 mb-6" : "mb-8"}`}>

            {/* 🧵 [연결 꺽쇠] 대댓글일 때만 왼쪽 기둥에서 아바타로 연결 (ㄴ자만 담당) */}
            {depth > 0 && (
              <div
	                className={`absolute left-[-21px] w-[21px] z-0 border-gray-100 dark:border-dark-800
                ${isLast
                  ? "top-[-32px] h-[52px] border-l-[1px] border-b-[1px] rounded-bl-xl"
                  : "top-[-32px] h-[52px] border-l-[1px] border-b-[1px] rounded-bl-xl"
                }
              `}
                /* 팁: 여기서 h-full이나 bottom-0을 쓰지 않고 고정 높이와 음수 top을 활용해
                   기존 기둥 선과 자연스럽게 '접점'만 생기도록 조절했습니다.
                */
              />
            )}

            {/* 1. 아바타 영역 */}
            <div className="relative shrink-0 z-10">
              <div className={`
	              flex items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-dark-800 border-2 border-white dark:border-dark-950
              ${depth > 0 ? "w-7 h-7" : "w-10 h-10"}
            `}>
                {c.user?.profile?.profileImage ? (
                  <img
                    src={c.user.profile.profileImage}
                    alt={c.userName || "익명"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className={`font-bold text-gray-400 uppercase ${depth > 0 ? "text-[10px]" : "text-xs"}`}>
                    {c.userName?.slice(0, 1) || "익"}
                  </span>
                )}
              </div>
            </div>

            {/* 2. 본문 카드 영역 */}
            <div className="flex-1 min-w-0 ml-3">
              <div className="group relative transition-all duration-200">
                {/* 상단: 작성자 및 시간 */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {c.user?.profile?.profileImage && (
                      <img
                        src={c.user.profile.profileImage}
                        alt=""
                        className="h-4 w-4 rounded-full object-cover"
                      />
                    )}
	                    <span className="text-[13px] font-bold text-gray-900 dark:text-dark-100">{c.userName || "익명"}</span>
                    <span className="text-[10px] text-gray-400">{dayjs(c.createdAt).fromNow()}</span>
                  </div>

                  {!c.isDeleted && (currentUser?.isAdmin || currentUser?.id === c.userId) && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        onClick={() => openEditModal(c)}
	                        className="!bg-transparent !p-1 !text-gray-300 hover:!text-gray-600 dark:!text-dark-500 dark:hover:!text-dark-200"
                        icon={<svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"/></svg>}
                      />
                      <Button
                        onClick={() => handleDelete(c)}
	                        className="!bg-transparent !p-1 !text-gray-300 hover:!text-red-400 dark:!text-dark-500 dark:hover:!text-red-400"
                        icon={<svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>}
                      />
                    </div>
                  )}
                </div>

	                <div className="mb-2 text-[14px] leading-relaxed text-gray-700 dark:text-dark-200">
                  {c.depth > 1 && parentUserName && (
	                    <span className="mr-1.5 font-bold text-gray-500 opacity-80 dark:text-dark-200">@{parentUserName}</span>
                  )}
	                  {c.isDeleted ? <span className="text-xs italic text-gray-300 dark:text-dark-500">삭제된 댓글입니다.</span> : c.content}
                </div>

                <div className="flex items-center gap-4">
	                  <button className="group/like flex cursor-pointer items-center gap-1 text-gray-300 transition-colors hover:text-rose-400 dark:text-dark-500 dark:hover:text-rose-400">
                    <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
                    <span className="text-[11px] font-bold">0</span>
                  </button>
                  <button
                    onClick={() => openReplyModal(c)}
	                    className="cursor-pointer text-[11px] font-bold uppercase tracking-tight text-gray-300 transition-colors hover:text-gray-700 dark:text-dark-500 dark:hover:text-dark-200"
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>
          </div>

          {c.children && renderComments(c.children, depth + 1, c.userName ?? undefined)}
        </div>
      );
    });
  };

  /** ====== 더보기 ====== */
  const handleLoadMore = async () => {
    if (page >= comments.pagination.totalPages) return;
    const nextPage = page + 1;
    setLoading(true);
    try {
      const result = await getCommentsPage(nextPage);

      // 🌟 중요: result가 아니라 result.data.items를 전달해야 함
      if (result.success && result.data) {
        setComments(prev => ({
          ...prev,
          items: mergeComments(prev.items, result.data.items), // ✅ data.items 확인!
          pagination: result.data.pagination,
        }));
        setPage(nextPage);
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className={`max-w-screen-md mx-auto px-2 py-16`}>
      {/* 댓글 작성 */}
      {permissions.doComment && (
        <div className="mb-12 group">
          <form onSubmit={handleSubmit} className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
	              className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-200/50 transition-all duration-300 focus-within:border-gray-300 focus-within:ring-4 focus-within:ring-gray-200/70 dark:border-dark-800 dark:bg-dark-900 dark:shadow-black/30 dark:focus-within:border-dark-500 dark:focus-within:ring-dark-800/60"
            >
              {/* 1. 상단 정보 바 (Status Bar) */}
	              <div className="flex items-center justify-between border-b border-gray-50 bg-gray-50/30 px-4 py-2 dark:border-dark-800 dark:bg-dark-950/50">
                <div className="flex items-center gap-2">
	                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-gray-500 dark:bg-dark-300" />
	                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-dark-400">New Comment</span>
                </div>
	                <div className="text-[10px] font-medium italic text-gray-400 dark:text-dark-500">
                  {currentUser?.nickName}님으로 작성 중
                </div>
              </div>

              {/* 2. 메인 입력 영역 */}
              <div onClick={() => setIsComposerOpen(true)}>
                {isComposerOpen ? (
                  <>
                    <div className="p-4">
                      <TiptapEditor
                        ref={editorRef}
                        initialContent=""
                        variant="compact"
                        onChange={(html: string) => setNewContent(html)}
                      />
                    </div>

                    <div className="px-4 pb-4">
                      <Attachment.Box
                        content={newContent}
                        onFileClick={(file) => {
                          const editor = editorRef.current;
                          if (!editor) return;

                          if (file.mimeType.startsWith("image/")) {
                            editor.chain()
                              .focus()
                              .insertContent([
                                {
                                  type: "image",
                                  attrs: {
                                    src: file.path,
                                    alt: file.name,
                                  },
                                },
                                {
                                  type: "paragraph",
                                },
                              ])
                              .run();
                          } else {
                            editor.chain().focus().insertContent(
                              `<a href="${file.path}" target="_blank" class="text-blue-600 underline">${file.name}</a> `
                            ).run();
                          }
                        }}
                        onFileDelete={handleFileDelete}
                      />
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
	                    className="min-h-[140px] w-full p-5 text-left text-sm leading-relaxed text-gray-300 dark:text-dark-500"
                  >
                    따뜻한 댓글은 작성자에게 큰 힘이 됩니다...
                  </button>
                )}
              </div>

              {/* 3. 하단 툴바 및 버튼 바 */}
	              <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-4 py-3 transition-colors group-focus-within:bg-white dark:border-dark-800 dark:bg-dark-950/50 dark:group-focus-within:bg-dark-900">
                {/* 왼쪽: 도움말 또는 글자 수 */}
                <div className="flex flex-col">
	        <span className="text-[10px] font-medium text-gray-400 dark:text-dark-400">
          정성껏 작성 중...
        </span>
	                  <span className="font-mono text-[10px] tracking-tighter text-gray-300 dark:text-dark-500">
          {newContent.length} / 1000 characters
        </span>
	                  <label className="mt-2 flex cursor-pointer items-center gap-2 text-[11px] font-semibold text-gray-400 dark:text-dark-400">
                    <input
                      type="checkbox"
                      checked={newNotificationEnabled}
                      onChange={(event) => setNewNotificationEnabled(event.target.checked)}
	                      className="h-3.5 w-3.5 cursor-pointer rounded border-gray-300 accent-gray-700 dark:border-dark-600 dark:bg-dark-950 dark:accent-dark-300"
                    />
                    이 댓글의 답글 알림 받기
                  </label>
                </div>

                {/* 오른쪽: 등록 버튼 */}
                <Button
                  type="submit"
                  isLoading={loading}
                  disabled={!newContent.trim()}
                  className={`
          !py-2.5 !px-6 !rounded-xl !font-bold transition-all
          ${newContent.trim()
	                    ? "!bg-gray-900 !text-white shadow-lg shadow-gray-900/20 dark:!bg-dark-100 dark:!text-dark-950 dark:shadow-black/30"
	                    : "!bg-gray-100 !text-gray-400 dark:!bg-dark-800 dark:!text-dark-500"
                  }
        `}
                  icon={!loading && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                    </svg>
                  )}
                >
                  댓글 등록
                </Button>
              </div>
            </motion.div>
          </form>
        </div>
      )}


      {/* 댓글 목록 */}
      {renderList && renderComments(comments.items)}

      {/* 더보기 */}
      {renderList && page < comments.pagination.totalPages && (
        <div className="relative flex items-center justify-center my-12 px-4">
          {/* 🧶 배경을 가로지르는 은은한 구분선 */}
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
	            <div className="w-full border-t border-gray-100 dark:border-dark-800"></div>
          </div>

          {/* 🌟 Button 컴포넌트 활용 */}
          <Button
            onClick={handleLoadMore}
            isLoading={loading}
            className="
	        !relative !bg-white dark:!bg-dark-900 !px-8 !py-2.5 !rounded-full
	        !border-gray-200 dark:!border-dark-800 !text-gray-400 dark:!text-dark-400
	        hover:!border-gray-300 hover:!text-gray-700 dark:hover:!border-dark-600 dark:hover:!text-dark-100
        shadow-sm transition-all duration-300
      "
            icon={
              !loading && (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              )
            }
          >
            {loading ? "불러오는 중" : "댓글 더보기"}
          </Button>
        </div>
      )}

      {/* 대댓글 / 수정 모달 */}
      <Modal state={showModal} close={() => setShowModal(false)} position="center">
        <div className="p-6">
          <div className="relative">
            {/* 1. 부모 댓글 (Context) */}
            {!isEditMode && modalParent && (
              <div className="relative flex gap-3 pb-2">
                {/* 🧶 수직 연결선 (부모 아바타 아래에서 시작) */}
                <div
	                  className="absolute left-[15px] top-8 bottom-0 w-[2px] bg-gray-100 dark:bg-dark-800"
                  style={{ height: 'calc(100% + 16px)' }} // 아래 입력창까지 강제로 연결
                />

                <div className="shrink-0 z-10">
	                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-gray-100 shadow-sm dark:border-dark-950 dark:bg-dark-800">
	            <span className="text-[16px] font-bold uppercase text-gray-400 dark:text-dark-300">
              {modalParent.nickName?.slice(0, 1)}
            </span>
                  </div>
                </div>

	                <div className="flex-1 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/50 p-3 dark:border-dark-800 dark:bg-dark-900">
                  {/* 1. 상단 메타 정보 (고정) */}
                  <div className="flex items-center gap-2 mb-2">
	                    <span className="text-[11px] font-bold text-gray-700 dark:text-dark-100">@{modalParent.nickName}</span>
	                    <span className="text-[10px] font-medium text-gray-400 dark:text-dark-500">
      {dayjs(modalParent.createdAt).fromNow()}
    </span>
                  </div>

                  {/* 2. 내용 영역 (스크롤 적용) */}
                  <div className="relative">
	                    <p className="max-h-[80px] overflow-y-auto pr-2 text-[13px] leading-relaxed text-gray-500 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 dark:text-dark-400 dark:scrollbar-thumb-dark-700">
                      {modalParent.content}
                    </p>

                    {/* 🌟 선택 사항: 내용이 아주 길 때 하단이 잘린 느낌을 주는 그라데이션 페이드 */}
	                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-gray-50/80 to-transparent dark:from-dark-900" />
                  </div>
                </div>
              </div>
            )}

            {/* 2. 대댓글 입력 폼 */}
            <form
              onSubmit={handleModalSubmit}
              className={`relative ${!isEditMode ? "pl-11 pt-2" : ""}`}
            >
              {/* 🧶 L자형 연결 커브 (선이 끊어지지 않게 보정) */}
              {!isEditMode && modalParent && (
                <div
	                  className="absolute left-[15px] top-[-10px] h-8 w-7 rounded-bl-xl border-b-2 border-l-2 border-gray-100 dark:border-dark-800"
                  style={{ pointerEvents: 'none' }}
                />
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
	                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-100 transition-all duration-300 focus-within:border-gray-300 focus-within:ring-4 focus-within:ring-gray-200/70 dark:border-dark-800 dark:bg-dark-900 dark:shadow-black/30 dark:focus-within:border-dark-500 dark:focus-within:ring-dark-800/60"
              >
                {/* 입력창 상단: 유저 정보 */}
	                <div className="flex items-center gap-2 border-b border-gray-50 bg-gray-50/30 px-4 py-2 dark:border-dark-800 dark:bg-dark-950/50">
	                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-600 dark:bg-dark-300">
	                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white dark:bg-dark-950" />
                  </div>
	                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-dark-400">
            {isEditMode ? "Edit Comment" : "New Reply"}
          </span>
                </div>

                <textarea
                  value={modalContent}
                  onChange={(e) => setModalContent(e.target.value)}
                  placeholder={isEditMode ? "내용을 수정해주세요..." : "따뜻한 답변을 기다리고 있어요."}
	                  className="min-h-[140px] w-full resize-none bg-transparent p-4 text-sm leading-relaxed text-gray-700 outline-none placeholder:text-gray-300 dark:text-dark-100 dark:placeholder:text-dark-500"
                  autoFocus
                />

                {/* 입력창 하단: 툴바 스타일 */}
	                <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-4 py-2 dark:border-dark-800 dark:bg-dark-950/50">
                  {!isEditMode ? (
	                    <label className="flex cursor-pointer items-center gap-2 text-[11px] font-semibold text-gray-400 dark:text-dark-400">
                      <input
                        type="checkbox"
                        checked={modalNotificationEnabled}
                        onChange={(event) => setModalNotificationEnabled(event.target.checked)}
	                        className="h-3.5 w-3.5 cursor-pointer rounded border-gray-300 accent-gray-700 dark:border-dark-600 dark:bg-dark-950 dark:accent-dark-300"
                      />
                      답글 알림 받기
                    </label>
                  ) : (
	                    <span className="text-[10px] text-gray-300 dark:text-dark-500">댓글 내용을 수정합니다.</span>
                  )}
	                  <span className="font-mono text-[10px] tracking-tight text-gray-400 dark:text-dark-500">
            {modalContent.length} / 1000
          </span>
                </div>
              </motion.div>

              {/* 3. 하단 버튼 그룹 */}
              <div className="flex justify-end mt-4 gap-2">
                <Button
                  type="button"

                  onClick={() => setShowModal(false)}
                  disabled={loading}
	                  className="font-semibold !text-gray-400 hover:!bg-gray-200 hover:!text-gray-600 dark:hover:!bg-dark-800 dark:hover:!text-dark-100"
                >
                  취소
                </Button>

                <Button
                  type="submit"

                  isLoading={loading}
                  className={
                    isEditMode
	                      ? "!bg-gray-100 !text-gray-700 hover:!bg-gray-900 hover:!text-white !px-7 !font-bold dark:!bg-dark-800 dark:!text-dark-200 dark:hover:!bg-dark-100 dark:hover:!text-dark-950"
	                      : "!bg-gray-900 !text-white hover:!bg-gray-800 !px-7 !font-bold shadow-lg shadow-gray-900/20 dark:!bg-dark-100 dark:!text-dark-950 dark:hover:!bg-dark-200"
                  }
                  icon={!loading && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                      <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925a1.5 1.5 0 001.035 1.035l4.925 1.414a.75.75 0 000 1.44l-4.925 1.414a1.5 1.5 0 00-1.035 1.035l-1.414 4.925a.75.75 0 00.95.826l14.823-7.412a.75.75 0 000-1.342L3.105 2.29z" />
                    </svg>
                  )}
                >
                  {isEditMode ? "수정" : "보내기"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </div>
  );
}
