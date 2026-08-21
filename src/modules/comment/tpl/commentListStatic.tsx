import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";
import DOMPurify from "isomorphic-dompurify";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { Link as TiptapLink } from "@tiptap/extension-link";
import { Underline } from "@tiptap/extension-underline";
import { TextAlign } from "@tiptap/extension-text-align";
import { Highlight } from "@tiptap/extension-highlight";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import { CommentWithChildren } from "@/modules/comment/actions/_type";
import CommentItemActions from "./commentItemActions";

dayjs.extend(relativeTime);
dayjs.locale("ko");

const commentExtensions = [
  StarterKit.configure({
    code: {
      HTMLAttributes: {
        class: "bg-teal-100 text-teal-600 px-1.5 py-0.5 rounded-md font-mono text-[0.9em] font-medium",
      },
    },
    blockquote: {
      HTMLAttributes: {
	        class: "border-l-4 border-gray-300 pl-4 italic text-gray-600 dark:border-dark-700 dark:text-dark-300",
      },
    },
    bulletList: false,
    orderedList: false,
  }),
  BulletList.configure({
    HTMLAttributes: { class: "list-disc ml-6" },
  }),
  OrderedList.configure({
    HTMLAttributes: { class: "list-decimal ml-6" },
  }),
  ListItem,
  Underline,
  Highlight.configure({ multicolor: true }),
  TiptapLink.configure({
    openOnClick: true,
    HTMLAttributes: { class: "text-blue-600 underline cursor-pointer" },
  }),
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Image,
];

const renderCommentContent = (content: string) => {
  if (!content) return null;

  try {
    const parsed = JSON.parse(content);
    if (parsed?.type === "doc") {
      const html = generateHTML(parsed, commentExtensions);
      const cleanHtml = DOMPurify.sanitize(html, {
        ADD_ATTR: ["style", "target", "class", "rel"],
        ADD_TAGS: ["mark"],
      });

      return (
        <div
	          className="prose prose-zinc prose-sm max-w-none dark:prose-invert dark:prose-p:text-dark-200 dark:prose-li:text-dark-200 prose-pre:bg-gray-50 prose-pre:text-gray-700 prose-img:rounded-xl prose-img:border prose-img:border-gray-100 dark:prose-pre:bg-dark-900 dark:prose-pre:text-dark-200 dark:prose-img:border-dark-800"
          dangerouslySetInnerHTML={{ __html: cleanHtml }}
        />
      );
    }
  } catch {
    return <>{content}</>;
  }

  return <>{content}</>;
};

interface CommentListStaticProps {
  documentId: number;
  comments: CommentWithChildren[];
  currentUser: any;
  canReply: boolean;
  upsertComment: (args: {
    documentId: number;
    content: string;
    parentId?: number;
    commentId?: number;
    notificationEnabled?: boolean;
    options?: { deleted?: boolean; remove?: boolean };
  }) => Promise<any>;
  className?: string;
}

const CommentListStatic = ({ documentId, comments, currentUser, canReply, upsertComment, className = "" }: CommentListStaticProps) => {
  const renderComments = (items: CommentWithChildren[], depth = 0, parentUserName?: string) => {
    return items.map((comment, index) => {
      const canManage = currentUser?.isAdmin || currentUser?.id === comment.userId;
      const isLast = index === items.length - 1;

      return (
        <article key={`${comment.id}-${comment.uuid}`} id={`comment-${comment.id}`} className="relative">
          {comment.children && comment.children.length > 0 && (
	            <div className="absolute left-[19px] top-10 bottom-0 z-0 w-[1px] bg-gray-100 dark:bg-dark-800" />
          )}

          <div className={`relative flex items-start ${depth > 0 ? "ml-10 mb-6" : "mb-8"}`}>
            {depth > 0 && (
              <div
	                className={`absolute left-[-21px] w-[21px] z-0 border-gray-100 dark:border-dark-800 ${
                  isLast
                    ? "top-[-32px] h-[52px] border-l-[1px] border-b-[1px] rounded-bl-xl"
                    : "top-[-32px] h-[52px] border-l-[1px] border-b-[1px] rounded-bl-xl"
                }`}
              />
            )}

            <div className="relative shrink-0 z-10">
              <div
	                className={`flex items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-dark-800 border-2 border-white dark:border-dark-950 ${
                  depth > 0 ? "w-7 h-7" : "w-10 h-10"
                }`}
                aria-hidden="true"
              >
                {comment.user?.profile?.profileImage ? (
                  <img
                    src={comment.user.profile.profileImage}
                    alt={comment.userName || "익명"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className={`font-bold text-gray-400 uppercase ${depth > 0 ? "text-[10px]" : "text-xs"}`}>
                    {comment.userName?.slice(0, 1) || "익"}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0 ml-3">
              <div className="group relative transition-all duration-200">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {comment.user?.profile?.profileImage && (
                      <img
                        src={comment.user.profile.profileImage}
                        alt=""
                        className="h-4 w-4 rounded-full object-cover"
                      />
                    )}
	                    <span className="text-[13px] font-bold text-gray-900 dark:text-dark-100">{comment.userName || "익명"}</span>
                    <time className="text-[10px] text-gray-400" dateTime={String(comment.createdAt)}>
                      {dayjs(comment.createdAt).fromNow()}
                    </time>
                  </div>

                  <CommentItemActions
                    documentId={documentId}
                    comment={comment}
                    canManage={canManage}
                    canReply={canReply}
                    variant="manage"
                    upsertComment={upsertComment}
                  />
                </div>

	                <div className="mb-2 whitespace-pre-wrap text-[14px] leading-relaxed text-gray-700 dark:text-dark-200">
                  {comment.depth > 1 && parentUserName && (
	                    <span className="mr-1.5 font-bold text-gray-500 opacity-80 dark:text-dark-200">@{parentUserName}</span>
                  )}
	                  {comment.isDeleted ? <span className="text-xs italic text-gray-300 dark:text-dark-500">삭제된 댓글입니다.</span> : renderCommentContent(comment.content)}
                </div>

                <CommentItemActions
                  documentId={documentId}
                  comment={comment}
                  canManage={canManage}
                  canReply={canReply}
                  upsertComment={upsertComment}
                />
              </div>
            </div>
          </div>

          {comment.children?.length > 0 && renderComments(comment.children, depth + 1, comment.userName ?? undefined)}
        </article>
      );
    });
  };

  return (
    <section className={`max-w-screen-md mx-auto px-2 pt-16 ${className}`} aria-label="댓글 목록">
      <h2 className="sr-only">댓글</h2>
      {comments.length > 0 ? renderComments(comments) : (
	        <p className="text-sm text-gray-400 dark:text-dark-500">아직 댓글이 없습니다.</p>
      )}
    </section>
  );
};

export default CommentListStatic;
