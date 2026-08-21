"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, MessageSquare } from "lucide-react";

import { getCommentListAll } from "./comment";

type CommentItem = Awaited<ReturnType<typeof getCommentListAll>>[number];

const extractCommentPreview = (content?: string | null) => {
  if (!content) return "";

  try {
    const parsed = JSON.parse(content);
    if (parsed?.type !== "doc") return content;

    const textParts: string[] = [];
    let imageCount = 0;

    const walk = (node: any) => {
      if (!node) return;
      if (node.type === "text" && node.text) textParts.push(node.text);
      if (node.type === "image") imageCount += 1;
      if (Array.isArray(node.content)) node.content.forEach(walk);
    };

    walk(parsed);

    const text = textParts.join(" ").replace(/\s+/g, " ").trim();
    if (text) return text;
    if (imageCount > 0) return imageCount > 1 ? `이미지 ${imageCount}개` : "이미지";

    return "";
  } catch {
    return content;
  }
};

const formatDate = (value: Date | string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const CommentList = ({ count = 6 }: { mid?: string; count?: number }) => {
  const [items, setItems] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const comments = await getCommentListAll(count);
        if (mounted) setItems(comments || []);
      } catch (error) {
        console.error("댓글 로드 실패:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadData();

    return () => {
      mounted = false;
    };
  }, [count]);

  if (loading) {
    return (
      <div className="divide-y divide-gray-100 dark:divide-dark-800">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 py-4">
            <div className="h-9 w-9 animate-pulse rounded-lg bg-gray-100 dark:bg-dark-800" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100 dark:bg-dark-800" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100 dark:bg-dark-800" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-44 items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm font-medium text-gray-400 dark:border-dark-800 dark:text-dark-500">
        최근 댓글이 없습니다.
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-dark-800">
      {items.map((item) => {
        const document = item.document;
        const module = document?.module;
        if (!document || !module) return null;

        const preview = extractCommentPreview(item.content);

        return (
          <Link
            key={item.id}
            href={`/posts/${module.mid}/${document.slug}#comment-${item.id}`}
            className="group flex items-start gap-3 py-4"
          >
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-colors group-hover:bg-gray-950 group-hover:text-white dark:bg-dark-800 dark:text-dark-300 dark:group-hover:bg-dark-100 dark:group-hover:text-dark-950">
              <MessageSquare size={15} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="truncate text-sm font-bold text-gray-900 dark:text-dark-100">{document.title || "제목 없음"}</span>
                <ArrowUpRight size={13} className="shrink-0 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-dark-600" />
              </span>
              <span className="mt-1 line-clamp-1 text-xs leading-5 text-gray-400 dark:text-dark-500">
                {preview || "내용 없음"}
              </span>
            </span>
            <span className="shrink-0 text-right text-[11px] font-semibold text-gray-400 dark:text-dark-500">
              {formatDate(item.createdAt)}
            </span>
          </Link>
        );
      })}
    </div>
  );
};

export default CommentList;
