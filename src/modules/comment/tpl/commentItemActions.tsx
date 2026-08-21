"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Button from "@components/button/Button";
import Modal from "@components/modal/Modal";
import TiptapEditor from "@components/editor/tiptap/tiptapEditor";
import { Attachment } from "@/modules/attachment";
import { CommentWithChildren } from "@/modules/comment/actions/_type";
import type { Attachment as IAttachment } from "@/modules/attachment/actions/_type";

interface CommentItemActionsProps {
  documentId: number;
  comment: CommentWithChildren;
  canManage: boolean;
  canReply: boolean;
  variant?: "inline" | "manage";
  upsertComment: (args: {
    documentId: number;
    content: string;
    parentId?: number;
    commentId?: number;
    notificationEnabled?: boolean;
    options?: { deleted?: boolean; remove?: boolean };
  }) => Promise<any>;
}

const getCommentPreview = (content: string) => {
  try {
    const parsed = JSON.parse(content);
    if (parsed?.type === "doc") {
      const extractText = (nodes: any[] = []): string =>
        nodes.map(node => {
          if (node.type === "text") return node.text || "";
          if (node.type === "image") return "[이미지]";
          if (node.content) return extractText(node.content);
          return "";
        }).join(" ");

      return extractText(parsed.content).replace(/\s+/g, " ").trim();
    }
  } catch {
    return content;
  }

  return content;
};

const CommentItemActions = ({
  documentId,
  comment,
  canManage,
  canReply,
  variant = "inline",
  upsertComment,
}: CommentItemActionsProps) => {
  const router = useRouter();
  const editorRef = useRef<any>(null);
  const [mode, setMode] = useState<"reply" | "edit" | null>(null);
  const [content, setContent] = useState("");
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const openReply = () => {
    setMode("reply");
    setContent("");
    setNotificationEnabled(true);
  };

  const openEdit = () => {
    setMode("edit");
    setContent(comment.content);
    setNotificationEnabled(true);
  };

  const closeModal = () => {
    setMode(null);
    setContent("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!mode || !editorRef.current || editorRef.current.isEmpty || loading) return;

    setLoading(true);
    try {
      const jsonContent = editorRef.current.getJSON();
      const result = await upsertComment({
        documentId,
        content: JSON.stringify(jsonContent),
        parentId: mode === "reply" ? comment.id : undefined,
        commentId: mode === "edit" ? comment.id : undefined,
        notificationEnabled: mode === "reply" ? notificationEnabled : undefined,
      });

      if (!result.success) {
        alert(result.message || (mode === "reply" ? "답글 등록에 실패했습니다." : "댓글 수정에 실패했습니다."));
        return;
      }

      closeModal();
      router.refresh();
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

    setContent(editor.getHTML());
  };

  const handleDelete = async () => {
    if (!window.confirm("삭제하시겠습니까?")) return;

    const hasChildren = !!comment.children?.length;
    const result = await upsertComment({
      documentId,
      content: "",
      commentId: comment.id,
      options: {
        deleted: hasChildren,
        remove: !hasChildren,
      },
    });

    if (!result.success) {
      alert(result.message || "댓글 삭제에 실패했습니다.");
      return;
    }

    router.refresh();
  };

  const modal = (
    <Modal state={!!mode} close={closeModal} position="center">
      <form onSubmit={handleSubmit} className="max-h-[85vh] overflow-y-auto p-6">
        <div className="relative">
          {mode === "reply" && (
            <div className="relative flex gap-3 pb-2">
              <div
	                className="absolute left-[15px] top-8 bottom-0 w-[2px] bg-gray-100 dark:bg-dark-800"
                style={{ height: "calc(100% + 16px)" }}
              />
              <div className="shrink-0 z-10">
	                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-gray-100 shadow-sm dark:border-dark-950 dark:bg-dark-800">
	                  <span className="text-[16px] font-bold uppercase text-gray-400 dark:text-dark-300">
                    {comment.userName?.slice(0, 1) || "익"}
                  </span>
                </div>
              </div>
	              <div className="flex-1 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/50 p-3 dark:border-dark-800 dark:bg-dark-900">
                <div className="flex items-center gap-2 mb-2">
	                  <span className="text-[11px] font-bold text-gray-700 dark:text-dark-100">@{comment.userName || "익명"}</span>
                </div>
                <div className="relative">
	                  <p className="max-h-[80px] overflow-y-auto pr-2 text-[13px] leading-relaxed text-gray-500 dark:text-dark-400">
                    {getCommentPreview(comment.content)}
                  </p>
	                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-gray-50/80 to-transparent dark:from-dark-900" />
                </div>
              </div>
            </div>
          )}

          <div className={`relative ${mode === "reply" ? "pl-11 pt-2" : ""}`}>
            {mode === "reply" && (
              <div
	                className="absolute left-[15px] top-[-10px] h-8 w-7 rounded-bl-xl border-b-2 border-l-2 border-gray-100 dark:border-dark-800"
                style={{ pointerEvents: "none" }}
              />
            )}
	            <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-100 transition-all duration-300 focus-within:border-gray-300 focus-within:ring-4 focus-within:ring-gray-200/70 dark:border-dark-800 dark:bg-dark-900 dark:shadow-black/30 dark:focus-within:border-dark-500 dark:focus-within:ring-dark-800/60">
	              <div className="flex items-center gap-2 border-b border-gray-50 bg-gray-50/30 px-4 py-2 dark:border-dark-800 dark:bg-dark-950/50">
	                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-600 dark:bg-dark-300">
	                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white dark:bg-dark-950" />
                </div>
	                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-dark-400">
                  {mode === "edit" ? "Edit Comment" : "New Reply"}
                </span>
              </div>
              <div className="p-4">
                <TiptapEditor
                  key={`${mode}-${comment.id}`}
                  ref={editorRef}
                  initialContent={mode === "edit" ? comment.content : ""}
                  variant="compact"
                  onChange={(html: string) => setContent(html)}
                />
              </div>
              <div className="px-4 pb-4">
                <Attachment.Box
                  content={content}
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
	              <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-4 py-2 dark:border-dark-800 dark:bg-dark-950/50">
                {mode === "reply" ? (
	                  <label className="flex cursor-pointer items-center gap-2 text-[11px] font-semibold text-gray-400 dark:text-dark-400">
                    <input
                      type="checkbox"
                      checked={notificationEnabled}
                      onChange={(event) => setNotificationEnabled(event.target.checked)}
	                      className="h-3.5 w-3.5 cursor-pointer rounded border-gray-300 accent-gray-700 dark:border-dark-600 dark:bg-dark-950 dark:accent-dark-300"
                    />
                    답글 알림 받기
                  </label>
                ) : (
	                  <span className="text-[10px] text-gray-300 dark:text-dark-500">댓글 내용을 수정합니다.</span>
                )}
	                <span className="font-mono text-[10px] tracking-tight text-gray-400 dark:text-dark-500">
                  {content.length} / 1000
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4 gap-2">
            <Button
              type="button"
              onClick={closeModal}
              disabled={loading}
	              className="font-semibold !text-gray-400 hover:!bg-gray-200 hover:!text-gray-600 dark:hover:!bg-dark-800 dark:hover:!text-dark-100"
            >
              취소
            </Button>
            <Button
              type="submit"
              isLoading={loading}
              disabled={!content.trim()}
              className={
                mode === "edit"
	                  ? "!bg-gray-100 !text-gray-700 hover:!bg-gray-900 hover:!text-white !px-7 !font-bold dark:!bg-dark-800 dark:!text-dark-200 dark:hover:!bg-dark-100 dark:hover:!text-dark-950"
	                  : "!bg-gray-900 !text-white hover:!bg-gray-800 !px-7 !font-bold shadow-lg shadow-gray-900/20 dark:!bg-dark-100 dark:!text-dark-950 dark:hover:!bg-dark-200"
              }
            >
              {mode === "edit" ? "수정" : "보내기"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );

  if (variant === "manage") {
    return (
      <>
        {canManage && !comment.isDeleted && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              type="button"
              onClick={openEdit}
	              className="!bg-transparent !p-1 !text-gray-300 hover:!text-gray-600 dark:!text-dark-500 dark:hover:!text-dark-200"
              icon={<svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 0 0 1 3 18.75V8.25A2.25 0 0 1 5.25 6H10" /></svg>}
            />
            <Button
              type="button"
              onClick={handleDelete}
              className="!p-1 !text-gray-300 hover:!text-red-400 !bg-transparent"
              icon={<svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>}
            />
          </div>
        )}
        {modal}
      </>
    );
  }

  return (
    <>
      <div className="mt-2 flex items-center gap-3">
	          <button className="group/like flex cursor-pointer items-center gap-1 text-gray-300 transition-colors hover:text-rose-400 dark:text-dark-500 dark:hover:text-rose-400">
          <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
          <span className="text-[11px] font-bold">0</span>
        </button>

        {canReply && !comment.isDeleted && (
          <button
            type="button"
            onClick={openReply}
	            className="cursor-pointer text-[11px] font-bold uppercase tracking-tight text-gray-300 transition-colors hover:text-gray-700 dark:text-dark-500 dark:hover:text-dark-200"
          >
            Reply
          </button>
        )}

      </div>
      {modal}
    </>
  );
};

export default CommentItemActions;
