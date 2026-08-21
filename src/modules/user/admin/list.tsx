"use client";

import React, { useCallback, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Activity, Edit3, Plus, Search, Trash2, UsersRound } from "lucide-react";

import { UserInfo, UserListResponseData } from "@/modules/user/actions/_type";
import { removeUserAction, updateUserStatusAdminAction } from "@/modules/user/actions/user.action";
import {
  getUserTimelineAdminAction,
  UserTimelineFilter,
} from "@/modules/user/actions/timeline.action";
import PageNavigation from "@components/nav/PageNavigation";
import Button from "@components/button/Button";
import Bottom from "@components/panel/Bottom";
import Timeline from "@/modules/user/tpl/default/timeline";

type Props = {
  initialUserList: UserInfo[];
  initialNavigation: UserListResponseData["navigation"];
  title?: string;
  description?: string;
  basePath?: string;
  showStatusActions?: boolean;
};

const checkboxClass =
  "h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500";

const AdminUserTimelinePanel = ({ userId }: { userId: number }) => {
  const loadTimeline = useCallback((
    cursor?: string | null,
    limit?: number,
    filter?: UserTimelineFilter,
  ) => getUserTimelineAdminAction(userId, cursor, limit, filter), [userId]);

  return (
    <Timeline
      key={userId}
      loadTimelineAction={loadTimeline}
      showHeader={false}
      embedded
    />
  );
};

const statusMeta: Record<string, { label: string; className: string }> = {
  active: { label: "활성", className: "bg-emerald-50 text-emerald-600 ring-emerald-100" },
  pending: { label: "승인 대기", className: "bg-amber-50 text-amber-600 ring-amber-100" },
  blocked: { label: "차단", className: "bg-rose-50 text-rose-600 ring-rose-100" },
};

const AdminUserList = ({
  initialUserList,
  initialNavigation,
  title = "회원 목록",
  description,
  basePath = "/admin/user/list",
  showStatusActions = true,
}: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchTarget = searchParams?.get("target") || "accountId";
  const searchKeyword = searchParams?.get("keyword") || "";
  const timelineUserId = Number(searchParams?.get("timelineUserId")) || null;
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isPending, startTransition] = useTransition();

  const allChecked = initialUserList.length > 0 && selectedIds.length === initialUserList.length;
  const timelineCloseHref = (() => {
    const params = new URLSearchParams(searchParams?.toString());
    params.delete("timelineUserId");
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  })();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const target = formData.get("target") as string;
    const keyword = formData.get("keyword") as string;

    router.push(`${basePath}?page=1&target=${target}&keyword=${keyword}`);
  };

  const handleCheck = (id: number, isChecked: boolean) => {
    setSelectedIds((prev) =>
      isChecked ? [...prev, id] : prev.filter((selectedId) => selectedId !== id),
    );
  };

  const handleCheckAll = (isChecked: boolean) => {
    setSelectedIds(isChecked ? initialUserList.map((user) => user.id) : []);
  };

  const handleDelete = () => {
    if (selectedIds.length === 0) {
      alert("삭제할 회원을 선택해주세요.");
      return;
    }

    if (!window.confirm(`선택하신 ${selectedIds.length}명의 회원을 정말 삭제하시겠습니까?`)) return;

    startTransition(async () => {
      try {
        const results = await Promise.all(selectedIds.map((id) => removeUserAction(id)));
        const hasError = results.some((res) => !res.success);

        alert(hasError ? "일부 회원 삭제 중 오류가 발생했습니다." : "성공적으로 삭제되었습니다.");
        setSelectedIds([]);
        router.refresh();
      } catch {
        alert("서버 통신 중 오류가 발생했습니다.");
      }
    });
  };

  const handleOpenTimeline = (id: number) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set("timelineUserId", id.toString());
    router.push(`${basePath}?${params.toString()}`);
  };

  const handleStatusChange = (id: number, status: "active" | "pending" | "blocked") => {
    startTransition(async () => {
      const result = await updateUserStatusAdminAction(id, status);
      alert(result.message);
      if (result.success) router.refresh();
    });
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-gray-400">
            <UsersRound size={13} />
            User Control
          </div>
          <div className="mt-2 text-lg font-semibold text-gray-700 dark:text-dark-100">{title}</div>
          <div className="mt-1 text-sm text-gray-400">
            {description || `전체 ${initialNavigation.totalCount}명 중 ${initialUserList.length}명을 표시하고 있습니다.`}
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
          <form onSubmit={handleSearch} className="flex min-w-0 flex-1 items-center rounded-md border border-gray-200 bg-white px-3 shadow-sm shadow-gray-100 xl:w-[420px] xl:flex-none dark:border-dark-700 dark:bg-dark-900 dark:shadow-black/20">
            <select
              name="target"
              defaultValue={searchTarget}
              className="shrink-0 bg-transparent py-2.5 pr-3 text-sm text-gray-500 outline-none dark:text-dark-300"
            >
              <option value="accountId">아이디</option>
              <option value="nickName">닉네임</option>
              <option value="email_address">이메일</option>
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

          <Link href="/admin/user/create" className="inline-flex w-auto items-center justify-center gap-2 rounded bg-blue-100 px-5 py-2 text-xs font-medium text-blue-500 transition-colors duration-200 hover:bg-blue-600 hover:text-white">
            <Plus size={15} />
            회원추가
          </Link>
          <Button
            type="button"
            onClick={handleDelete}
            isLoading={isPending}
            disabled={selectedIds.length === 0 || isPending}
            fullWidth={false}
            icon={<Trash2 size={14} />}
          >
            삭제
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-gray-100 bg-white shadow-sm shadow-gray-100 dark:border-dark-800 dark:bg-dark-900 dark:shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80 dark:border-dark-800 dark:bg-dark-950/70">
                <th className="w-16 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">ID</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">Account</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">Email</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">Nickname</th>
                <th className="w-28 px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</th>
                <th className="w-28 px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">Timeline</th>
                <th className="w-28 px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">Edit</th>
                <th className="w-14 px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    className={checkboxClass}
                    checked={allChecked}
                    onChange={(e) => handleCheckAll(e.target.checked)}
                    aria-label="전체 선택"
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {initialUserList.length > 0 ? (
                initialUserList.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 transition-colors last:border-b-0 hover:bg-blue-50/40 dark:border-dark-800 dark:hover:bg-white/[0.04]">
                    <td className="px-4 py-4 text-sm font-medium text-gray-400">{item.id}</td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-semibold text-gray-800 dark:text-dark-100">{item.accountId}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-dark-300">{item.email_address}</td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-dark-300">{item.nickName}</td>
                    <td className="px-4 py-4 text-center">
                      {(() => {
                        const meta = statusMeta[item.status || "active"] || statusMeta.active;

                        return (
                          <div className="flex flex-col items-center gap-2">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${meta.className}`}>
                              {meta.label}
                            </span>
                            {showStatusActions && item.status === "pending" && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(item.id, "active")}
                                disabled={isPending}
                                className="cursor-pointer rounded-md bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600 transition-colors hover:bg-emerald-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                승인
                              </button>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenTimeline(item.id)}
                        className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-md bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-500 transition-colors hover:bg-cyan-500 hover:text-white dark:bg-dark-800 dark:text-dark-300"
                      >
                        <Activity size={13} />
                        보기
                      </button>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Link href={`/admin/user/update/${item.id}`} className="inline-flex items-center justify-center gap-1 rounded-md bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-500 transition-colors hover:bg-gray-900 hover:text-white dark:bg-dark-800 dark:text-dark-300 dark:hover:bg-cyan-500 dark:hover:text-dark-950">
                        <Edit3 size={13} />
                        수정
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        className={checkboxClass}
                        checked={selectedIds.includes(item.id)}
                        onChange={(e) => handleCheck(item.id, e.target.checked)}
                        aria-label={`${item.accountId} 선택`}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-sm text-gray-400">조회된 회원이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {initialNavigation.totalPages > 0 && (
        <div className="mt-6 flex justify-center">
          <PageNavigation page={initialNavigation.page} totalPages={initialNavigation.totalPages} />
        </div>
      )}

      {timelineUserId && (
        <Bottom closeHref={timelineCloseHref}>
          <AdminUserTimelinePanel userId={timelineUserId} />
        </Bottom>
      )}
    </div>
  );
};

export default AdminUserList;
