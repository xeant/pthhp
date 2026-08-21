import React from "react";
import DOMPurify from "isomorphic-dompurify";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import PostNotPermission from "@/modules/posts/tpl/default/notPermission";
import Button from "@components/button/Button";
import CodeBlockShiki from 'tiptap-extension-code-block-shiki'
import ReadActions from "./readActions";
import { codeToHtml } from "shiki";

// ✅ TipTap 변환 관련 임포트 추가
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Image } from "@tiptap/extension-image";
import { Link as TiptapLink } from "@tiptap/extension-link";
import { Underline } from "@tiptap/extension-underline";
import { TextAlign } from "@tiptap/extension-text-align";
import { Highlight } from "@tiptap/extension-highlight";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";

dayjs.extend(relativeTime);

const SHIKI_THEME = 'slack-ochin';

const decodeHtmlEntities = (value: string) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

const highlightCodeBlocks = async (html: string) => {
  const codeBlockRegex = /<pre\b[^>]*>\s*<code\b([^>]*)>([\s\S]*?)<\/code>\s*<\/pre>/g;
  const matches = [...html.matchAll(codeBlockRegex)];

  if (matches.length === 0) return html;

  let highlightedHtml = html;

  for (const match of matches) {
    const codeAttrs = match[1] || "";
    const language = codeAttrs.match(/language-([A-Za-z0-9_-]+)/)?.[1] || 'typescript';
    const code = decodeHtmlEntities(match[2]);
    let shikiHtml: string;

    try {
      shikiHtml = await codeToHtml(code, {
        lang: language,
        theme: SHIKI_THEME,
      });
    } catch {
      shikiHtml = await codeToHtml(code, {
        lang: 'typescript',
        theme: SHIKI_THEME,
      });
    }

    const styledHtml = shikiHtml.replace('<pre class="shiki slack-ochin"', '<pre class="shiki slack-ochin plextype-shiki-block"');

    highlightedHtml = highlightedHtml.replace(match[0], styledHtml);
  }

  return highlightedHtml;
};

// ✅ 에디터와 동일한 익스텐션 구성 및 스타일 클래스 주입
const tiptapExtensions = [
  StarterKit.configure({
    codeBlock: false,
    code: {
      HTMLAttributes: {
        class: 'bg-teal-100 text-teal-600 px-1.5 py-0.5 rounded-md font-mono text-[0.9em] font-medium',
      },
    },
    blockquote: {
      HTMLAttributes: {
        class: 'border-l-4 border-gray-300 pl-4 italic text-gray-600 dark:border-dark-700 dark:text-dark-300',
      },
    },
    bulletList: false,
    orderedList: false,
  }),
  CodeBlockShiki.configure({
    defaultTheme: SHIKI_THEME,
    defaultLanguage: 'typescript',
    HTMLAttributes: {
      class: 'plextype-shiki-block',
    },
  }),
  BulletList.configure({
    HTMLAttributes: { class: 'list-disc ml-6' },
  }),
  OrderedList.configure({
    HTMLAttributes: { class: 'list-decimal ml-6' },
  }),
  ListItem,

  Underline,
  Highlight.configure({ multicolor: true }),
  TiptapLink.configure({
    openOnClick: true,
    HTMLAttributes: { class: 'text-blue-600 underline cursor-pointer' }
  }),
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Table.configure({ resizable: true }),
  TableRow,
  TableHeader,
  TableCell,
  Image,
];

interface Participant {
  id: number;
  nickName: string;
  profile?: {
    profileImage?: string | null;
  } | null;
}

interface PostsReadProps {
  document: any;
  participants?: Participant[];
  postInfo: any;
  permissions: {
    doList: boolean;
    doRead: boolean;
    doWrite: boolean;
    doComment: boolean;
  };
  currentUser: any;
}

const PostsRead = async ({ document, participants = [], postInfo, permissions, currentUser }: PostsReadProps) => {
  const extraFields = postInfo?.extraFields || [];
  const extraData = document.extraFieldData || {};
  const visibleParticipants = participants.slice(0, 5);
  const hiddenParticipantCount = Math.max(participants.length - visibleParticipants.length, 0);

  const renderContent = async () => {
    let rawContent = document.content || "";

    if (rawContent.startsWith('"') && rawContent.endsWith('"')) {
      rawContent = rawContent.slice(1, -1);
    }

    if (!rawContent) return null;

    try {
      const jsonContent = JSON.parse(rawContent);

      // A: TipTap 데이터인 경우
      if (jsonContent.type === "doc") {
        const html = generateHTML(jsonContent, tiptapExtensions);
        const highlightedHtml = await highlightCodeBlocks(html);

        // 정렬 기능(style 속성)을 허용하도록 sanitize 설정
        const cleanHtml = DOMPurify.sanitize(highlightedHtml, {
          ADD_ATTR: ['style', 'target', 'class', 'rel'],
          ADD_TAGS: ['mark']
        });

        return (
          <div
            className="prose prose-zinc max-w-none dark:prose-invert
               prose-p:leading-8 prose-p:text-gray-700 dark:prose-p:text-dark-200
               prose-headings:text-gray-950 dark:prose-headings:text-dark-100
               prose-strong:text-gray-950 dark:prose-strong:text-dark-100
               prose-li:text-gray-700 dark:prose-li:text-dark-200
               prose-a:text-blue-600 dark:prose-a:text-sky-400
               prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0"
            dangerouslySetInnerHTML={{ __html: cleanHtml }}
          />
        );
      }

      if (jsonContent.blocks) return null;
    } catch (e) {
      const cleanHtml = DOMPurify.sanitize(rawContent, {
        ADD_ATTR: ['style', 'target', 'class', 'rel'],
        ADD_TAGS: ['mark']
      });

      return (
        <div
          className="prose prose-zinc max-w-none dark:prose-invert prose-p:leading-8 prose-p:text-gray-700 dark:prose-p:text-dark-200 prose-headings:text-gray-950 dark:prose-headings:text-dark-100 prose-strong:text-gray-950 dark:prose-strong:text-dark-100 prose-li:text-gray-700 dark:prose-li:text-dark-200 prose-a:text-blue-600 dark:prose-a:text-sky-400"
          dangerouslySetInnerHTML={{ __html: cleanHtml }}
        />
      );
    }

    const cleanHtml = DOMPurify.sanitize(rawContent, {
      ADD_ATTR: ['style', 'target', 'class', 'rel'],
      ADD_TAGS: ['mark']
    });

    return <div className="text-gray-700 dark:text-dark-200" dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
  };

  if (!permissions.doRead) return <PostNotPermission />;
  const content = await renderContent();

  return (
    <>
      <div className="max-w-screen-xl mx-auto px-3">
        <div className="mx-auto max-w-screen-md pt-10">
          <div className="hidden pt-12">
            <div className="text-[13px] text-black dark:text-white">
              {document.category?.title}
            </div>
          </div>
          <div className="flex justify-center pb-12 pt-12">
            <div
              className="inline-block text-3xl md:text-4xl font-bold text-black dark:text-dark-100 leading-10"
              style={{ lineHeight: "140%" }}
            >
              {document.title}
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-screen-md">
          <div className="flex items-center justify-between gap-8 pt-5 pb-3 px-3">
            <div className="flex items-center gap-4">
              <div className="">
                <div
                  className="dark:bg-dark-800 dark:hover:bg-dark-700 h-10 w-10 rounded-full bg-gray-200 hover:bg-gray-100"></div>
              </div>
              <div>
                <div className="flex gap-2">
                  <div className="line-clamp-1 text-sm font-semibold text-black dark:text-white">
                    {document.user.nickName}
                  </div>
                  <Button
                    type="button"
                    fullWidth={false}
                    className="!text-primary-500 hover:!text-primary-700 !bg-transparent !p-0 !h-auto !border-none"
                  >
                    Follow +
                  </Button>
                </div>
                <div className="flex gap-2">
                  <div className="dark:text-dark-400 text-sm text-gray-500">
                    {document.category?.title ?? ""}
                  </div>
                  <div className="flex gap-1 items-center">
                    <span className="w-[3px] h-[3px] rounded-full bg-gray-400"></span>
                  </div>
                  <div className="flex gap-2">
                    <div className="dark:text-dark-400 text-sm text-gray-500">
                      조회수
                    </div>
                    <div className="dark:text-dark-400 text-sm text-gray-500">
                      {document.readCount}
                    </div>
                  </div>
                  <div className="flex gap-1 items-center">
                    <span className="w-[3px] h-[3px] rounded-full bg-gray-400"></span>
                  </div>
                  <div className="dark:text-dark-400 text-sm text-gray-500">
                    {dayjs(document.createdAt).fromNow()}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className="flex items-center gap-4 justify-between border-t border-b border-gray-100 dark:border-dark-800 py-2">
            <div className="flex gap-4 px-3">
              <div className="flex gap-1 items-center">
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                </div>
                <div className="text-xs text-gray-500 dark:text-dark-500">{document.readCount}</div>
              </div>
              <div className="flex gap-1 items-center">
                <div className=" dark:text-dark-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                    />
                  </svg>
                </div>
                <div className="text-xs text-gray-500 dark:text-dark-500">
                  {document.commentCount}
                </div>
              </div>

              <div className="flex gap-1">
                <div className="flex items-center">
                  {visibleParticipants.length > 0 ? (
                    <>
                      {visibleParticipants.map((participant, index) => {
                        const profileImage = participant.profile?.profileImage;
                        const initial = participant.nickName?.slice(0, 1).toUpperCase() || "?";

                        return (
                          <span
                            key={participant.id}
                            title={participant.nickName}
                            className={`relative inline-flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gray-100 text-[10px] font-semibold text-gray-500 dark:border-dark-900 dark:bg-dark-700 dark:text-dark-200 ${index > 0 ? "-ml-2" : ""}`}
                          >
                            {profileImage ? (
                              <img
                                src={profileImage}
                                alt={participant.nickName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              initial
                            )}
                          </span>
                        );
                      })}
                      {hiddenParticipantCount > 0 && (
                        <span className="-ml-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-gray-900 px-1.5 text-[10px] font-semibold text-white dark:border-dark-900">
                          +{hiddenParticipantCount}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-gray-300 text-gray-300 dark:border-dark-600 dark:text-dark-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1}
                        stroke="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                        />
                      </svg>
                    </span>
                  )}
                </div>
                <div className="dark:text-dark-400 text-sm text-gray-500">
                  {participants.length}명의 사람들이 이 토론에 참여하였습니다.
                </div>
              </div>

            </div>
            <div>
              <div className="flex items-center gap-2 lg:gap-4">
                {/* 3. 좋아요 버튼 */}
                <Button
                  type="button"
                  fullWidth={false}
                  className="!h-10 !w-10 !rounded-full !p-0 flex items-center justify-center border border-gray-300/75 bg-white dark:bg-dark-800 dark:border-dark-600"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                    </svg>
                  }
                />
                {/* 4. 북마크 버튼 */}
                <Button
                  type="button"
                  fullWidth={false}
                  className="!h-10 !w-10 !rounded-full !p-0 flex items-center justify-center border border-gray-300/75 bg-white dark:bg-dark-800 dark:border-dark-600"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                    </svg>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="px-3">
        <div className="max-w-screen-md mx-auto">
          {extraFields.length > 0 && Object.keys(extraData).length > 0 && (
            <div className="">
              <div className="">
                {extraFields.map((field: any) => {
                  const value = extraData[field.name];
                  // 값이 없으면 렌더링하지 않음
                  if (value === undefined || value === null || value === "") return null;

                  return (
                    <div key={field.name} className="grid grid-cols-2 gap-4 flex items-center justify-between border-b border-gray-200/40 bg-gray-50 dark:border-dark-700/50 dark:bg-dark-900/70">
                      <div className="px-3 py-3 text-xs font-medium text-gray-500 dark:text-dark-400">{field.label}</div>
                      <div className="px-3 py-3 bg-white text-sm font-bold text-gray-900 dark:bg-dark-950 dark:text-dark-100">
                        {field.type === 'date' ? dayjs(value).format('YYYY-MM-DD') : String(value)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="postContent mx-auto max-w-screen-md px-3 py-6 lg:py-10 text-base font-normal leading-8 text-gray-800 dark:text-dark-200 tracking-tight">
        <style dangerouslySetInnerHTML={{ __html: `
      .plextype-shiki-block {
        display: block !important;
        background-color: #f9fafb  !important;
        border-radius: 16px;
        margin: 2.5rem 0;
        padding: 1.5rem 2rem !important; 
        font-family: 'JetBrains Mono', monospace !important;
        font-size: 14px !important;
        line-height: 1.8 !important;
        overflow-x: auto !important;
        scrollbar-width: none;
        white-space: pre !important;
      }

      .plextype-shiki-block code {
        background: none !important;
        padding: 0 !important;
        color: inherit !important;
        font-family: inherit !important;
        font-size: inherit !important;
        line-height: inherit !important;
        white-space: inherit !important;
      }

      .plextype-shiki-block::-webkit-scrollbar {
        display: none;
      }

      .dark .plextype-shiki-block {
        background-color: #12161e !important;
      }
    `}} />
        {content}
      </div>
      <ReadActions mid={postInfo.mid} slug={document.slug} canEdit={currentUser?.id === document.userId} />
      <div className="dark:bg-dark-900 border-t border-gray-100 dark:border-dark-800"></div>

    </>
  );
};

export default PostsRead;
