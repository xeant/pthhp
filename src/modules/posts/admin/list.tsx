"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Edit3, MessageSquareText, Plus, Search, Trash2 } from "lucide-react";

import { removePostsAdminAction } from "@/modules/posts/actions/posts.action";
import PageNavigation from "@components/nav/PageNavigation";
import Alert from "@components/message/Alert";
import Button from "@components/button/Button";

interface PostListInfo {
  id: number;
  mid: string;
  moduleName: string;
  moduleDesc: string;
  config: {
    skin?: string;
  } | null;
  status: string;
  createdAt: string;
}

interface PageNavigationInfo {
  totalCount: number;
  totalPages: number;
  page: number;
  listCount: number;
}

dayjs.extend(relativeTime);
dayjs.locale("ko");

const checkboxClass =
  "h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500";

const AdminPostsList = ({
  initialData,
  pagination,
}: {
  initialData: PostListInfo[];
  pagination: PageNavigationInfo;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchTarget = searchParams?.get("target") || "moduleName";
  const searchKeyword = searchParams?.get("keyword") || "";
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{
    type: string | null;
    message: string | null;
  } | null>(null);
  const [pageNavigation, setPageNavigation] = useState<PageNavigationInfo>(pagination);

  const allChecked = initialData.length > 0 && selectedIds.length === initialData.length;

  useEffect(() => {
    if (pagination) setPageNavigation(pagination);
  }, [pagination]);

  const handleCheck = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleAllCheck = (checked: boolean) => {
    setSelectedIds(checked ? initialData.map((item) => item.id) : []);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const target = formData.get("target") as string;
    const keyword = formData.get("keyword") as string;

    router.push(`?page=1&target=${target}&keyword=${encodeURIComponent(keyword)}`);
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) return;

    if (
      !confirm(
        `${selectedIds.length}개의 게시판을 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.`,
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await removePostsAdminAction(selectedIds, "/admin/posts/list");

      if (res.success) {
        alert(res.message);
        setSelectedIds([]);
      } else {
        setError({ type: "error", message: res.message });
      }
    } catch {
      setError({ type: "error", message: "시스템 오류가 발생했습니다." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-6">
          <Alert message={error.message} type={error.type} />
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-gray-400">
            <MessageSquareText size={13} />
            Board Control
          </div>
          <div className="mt-2 text-lg font-semibold text-gray-700 dark:text-dark-100">게시판 목록</div>
          <div className="mt-1 text-sm text-gray-400">
            전체 {pageNavigation.totalCount}개 중 {initialData.length}개를 표시하고 있습니다.
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
          <form onSubmit={handleSearch} className="flex min-w-0 flex-1 items-center rounded-md border border-gray-200 bg-white px-3 shadow-sm shadow-gray-100 xl:w-[420px] xl:flex-none dark:border-dark-700 dark:bg-dark-900 dark:shadow-black/20">
            <select
              name="target"
              defaultValue={searchTarget}
              className="shrink-0 bg-transparent py-2.5 pr-3 text-sm text-gray-500 outline-none dark:text-dark-300"
            >
              <option value="moduleName">게시판 이름</option>
              <option value="mid">게시판 ID</option>
            </select>
            <div className="h-4 w-px bg-gray-200 dark:bg-dark-700" />
            <input
              type="text"
              name="keyword"
              defaultValue={searchKeyword}
              className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-300 dark:text-dark-100 dark:placeholder:text-dark-500"
              placeholder="검색어 입력"
            />
            <button type="submit" className="cursor-pointer text-gray-400 transition-colors hover:text-gray-900 dark:hover:text-dark-100" aria-label="검색">
              <Search size={17} />
            </button>
          </form>

          <Link href="/admin/posts/create" className="inline-flex w-auto items-center justify-center gap-2 rounded bg-blue-100 px-5 py-2 text-xs font-medium text-blue-500 transition-colors duration-200 hover:bg-blue-600 hover:text-white">
            <Plus size={15} />
            게시판 추가
          </Link>
          <Button
            type="button"
            onClick={handleDelete}
            isLoading={loading}
            disabled={selectedIds.length === 0 || loading}
            fullWidth={false}
            icon={<Trash2 size={14} />}
          >
            선택 삭제
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-gray-100 bg-white shadow-sm shadow-gray-100 dark:border-dark-800 dark:bg-dark-900 dark:shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80 dark:border-dark-800 dark:bg-dark-950/70">
                <th className="w-16 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">ID</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">Module</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">Name</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">Skin</th>
                <th className="w-32 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">Created</th>
                <th className="w-28 px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">Edit</th>
                <th className="w-14 px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    onChange={(e) => handleAllCheck(e.target.checked)}
                    checked={allChecked}
                    className={checkboxClass}
                    aria-label="전체 선택"
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {initialData.length > 0 ? (
                initialData.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 transition-colors last:border-b-0 hover:bg-blue-50/40 dark:border-dark-800 dark:hover:bg-white/[0.04]">
                    <td className="px-4 py-4 text-sm font-medium text-gray-400">{item.id}</td>
                    <td className="px-4 py-4">
                      <div className="inline-flex rounded-md bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600 dark:bg-dark-800 dark:text-dark-300">
                        {item.mid}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/posts/${item.mid}`}
                        className="text-sm font-semibold text-gray-800 transition-colors hover:text-blue-600 dark:text-dark-100 dark:hover:text-cyan-400"
                      >
                        {item.moduleName}
                      </Link>
                      {item.moduleDesc && <div className="mt-1 text-xs text-gray-400">{item.moduleDesc}</div>}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-dark-300">{item.config?.skin || "default"}</td>
                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-dark-300">{dayjs(item.createdAt).fromNow()}</td>
                    <td className="px-4 py-4 text-center">
                      <Link href={`/admin/posts/${item.id}/update`} className="inline-flex items-center justify-center gap-1 rounded-md bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-500 transition-colors hover:bg-gray-900 hover:text-white dark:bg-dark-800 dark:text-dark-300 dark:hover:bg-cyan-500 dark:hover:text-dark-950">
                        <Edit3 size={13} />
                        수정
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => handleCheck(item.id)}
                        className={checkboxClass}
                        aria-label={`${item.moduleName} 선택`}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-sm text-gray-400">등록된 게시판이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pageNavigation.totalPages > 0 && (
        <div className="mt-6 flex justify-center">
          <PageNavigation {...pageNavigation} />
        </div>
      )}
    </div>
  );
};

export default AdminPostsList;
