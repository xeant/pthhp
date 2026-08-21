"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, FileText } from "lucide-react";

import { getDocumentListAll } from "./document";

type DocumentItem = Awaited<ReturnType<typeof getDocumentListAll>>[number];

const extractTextFromTiptap = (content: unknown) => {
  if (!content) return "";

  let json: any = content;

  if (typeof content === "string") {
    try {
      json = JSON.parse(content);
    } catch {
      return content;
    }
  }

  const texts: string[] = [];

  const walk = (node: any) => {
    if (!node) return;
    if (node.type === "text" && node.text) texts.push(node.text);
    if (Array.isArray(node.content)) node.content.forEach(walk);
  };

  walk(json);

  return texts.join(" ").replace(/\s+/g, " ").trim();
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

const DocumentList = ({ count = 6 }: { mid?: string; count?: number }) => {
  const [items, setItems] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const documents = await getDocumentListAll(count);
        if (mounted) setItems(documents || []);
      } catch (error) {
        console.error("게시글 로드 실패:", error);
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
        최근 게시글이 없습니다.
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-dark-800">
      {items.map((item) => {
        const module = item.module;
        if (!module) return null;

        const preview = extractTextFromTiptap(item.content);

        return (
          <Link
            key={item.id}
            href={`/posts/${module.mid}/${item.slug}`}
            className="group flex items-start gap-3 py-4"
          >
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-colors group-hover:bg-gray-950 group-hover:text-white dark:bg-dark-800 dark:text-dark-300 dark:group-hover:bg-dark-100 dark:group-hover:text-dark-950">
              <FileText size={15} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="truncate text-sm font-bold text-gray-900 dark:text-dark-100">{item.title || "제목 없음"}</span>
                <ArrowUpRight size={13} className="shrink-0 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-dark-600" />
              </span>
              <span className="mt-1 line-clamp-1 text-xs leading-5 text-gray-400 dark:text-dark-500">
                {preview || module.moduleName || "내용 없음"}
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

export default DocumentList;
