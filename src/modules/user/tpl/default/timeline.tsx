"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  Bell,
  Clock3,
  FileText,
  Loader2,
  MessageSquareText,
  Paperclip,
  ShieldCheck,
} from "lucide-react";

import HeaderUser from "@/modules/user/tpl/default/header";
import { ActionState } from "@/modules/user/actions/_type";
import {
  getUserTimelineAction,
  UserTimelineData,
  UserTimelineFilter,
  UserTimelineItem,
  UserTimelineKind,
} from "@/modules/user/actions/timeline.action";

type TimelineLoadAction = (
  cursor?: string | null,
  limit?: number,
  filter?: UserTimelineFilter,
) => Promise<ActionState<UserTimelineData>>;

type TimelineProps = {
  initialData?: UserTimelineData | null;
  loadTimelineAction?: TimelineLoadAction;
  showHeader?: boolean;
  embedded?: boolean;
};

const kindMeta: Record<UserTimelineKind, {
  label: string;
  color: string;
  marker: string;
  icon: React.ReactNode;
}> = {
  document: {
    label: "게시글",
    color: "bg-cyan-50 text-cyan-600 ring-cyan-100",
    marker: "bg-cyan-500 shadow-cyan-200",
    icon: <FileText size={16} />,
  },
  comment: {
    label: "댓글",
    color: "bg-violet-50 text-violet-600 ring-violet-100",
    marker: "bg-violet-500 shadow-violet-200",
    icon: <MessageSquareText size={16} />,
  },
  attachment: {
    label: "첨부파일",
    color: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    marker: "bg-emerald-500 shadow-emerald-200",
    icon: <Paperclip size={16} />,
  },
  notification: {
    label: "알림",
    color: "bg-amber-50 text-amber-600 ring-amber-100",
    marker: "bg-amber-500 shadow-amber-200",
    icon: <Bell size={16} />,
  },
};

const USER_TIMELINE_TIME_ZONE = "Asia/Seoul";

const formatDate = (date: Date | string) => {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: USER_TIMELINE_TIME_ZONE,
  }).format(new Date(date));
};

const formatRelativeDate = (date: Date | string) => {
  const target = new Date(date).getTime();
  const diff = Date.now() - target;
  const minute = 1000 * 60;
  const hour = minute * 60;
  const day = hour * 24;

  if (diff < minute) return "방금 전";
  if (diff < hour) return `${Math.floor(diff / minute)}분 전`;
  if (diff < day) return `${Math.floor(diff / hour)}시간 전`;
  if (diff < day * 7) return `${Math.floor(diff / day)}일 전`;

  return formatDate(date);
};

const groupTimelineItems = (items: UserTimelineItem[]) => {
  return items.reduce<Record<string, UserTimelineItem[]>>((groups, item) => {
    const date = new Date(item.createdAt);
    const key = new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
      timeZone: USER_TIMELINE_TIME_ZONE,
    }).format(date);

    groups[key] = groups[key] || [];
    groups[key].push(item);
    return groups;
  }, {});
};

const TimelineImage = ({ item }: { item: UserTimelineItem }) => {
  if (item.imageUrl) {
    return (
      <div className="mt-4 overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-200 dark:bg-dark-900 dark:ring-dark-800">
        <img src={item.imageUrl} alt={item.title} className="max-h-[420px] w-full object-cover" loading="lazy" />
      </div>
    );
  }

  if (item.kind !== "attachment") return null;

  return (
    <div className="mt-4 flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-gray-500 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-400">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-gray-400 ring-1 ring-gray-200 dark:bg-dark-800 dark:text-dark-300 dark:ring-dark-700">
        <Paperclip size={18} />
      </div>
      <div className="min-w-0">
        <div className="line-clamp-1 text-sm font-bold text-gray-800 dark:text-dark-100">{item.title}</div>
        <div className="mt-0.5 text-xs font-semibold text-gray-400">{item.description}</div>
      </div>
    </div>
  );
};

const TimelineAvatar = ({ imageUrl, name }: { imageUrl: string | null; name: string }) => {
  return (
    <div className="h-11 w-11 overflow-hidden rounded-full bg-gray-200 ring-1 ring-gray-200 dark:bg-dark-800 dark:ring-dark-700">
      {imageUrl ? (
        <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm font-bold text-gray-500 dark:text-dark-300">
          {name.slice(0, 1)}
        </div>
      )}
    </div>
  );
};

const TimelineCard = ({
  item,
  user,
}: {
  item: UserTimelineItem;
  user: UserTimelineData["user"];
}) => {
  const meta = kindMeta[item.kind];
  const card = (
    <article className="group rounded-md border border-gray-200 bg-white p-5 shadow-sm shadow-gray-100 transition-all duration-200 hover:border-gray-300 dark:border-dark-800 dark:bg-dark-900 dark:shadow-black/20 dark:hover:border-dark-700">
      <div className="flex items-start gap-3">
        <TimelineAvatar imageUrl={user.profileImage} name={user.nickName} />

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <div className="line-clamp-1 text-sm font-bold text-gray-900 dark:text-dark-100">{user.nickName}</div>
                <span className="text-xs font-semibold text-gray-400">@{user.accountId}</span>
                <span className="text-xs text-gray-300">·</span>
                <span className="text-xs font-semibold text-gray-400" suppressHydrationWarning>{formatRelativeDate(item.createdAt)}</span>
              </div>
              <div className="mt-1 text-xs font-medium text-gray-400">{item.meta}</div>
            </div>

            <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${meta.color}`}>
              {meta.icon}
              {meta.label}
            </span>
          </div>

          <div className="mt-4">
            <div className="line-clamp-2 text-[15px] font-bold leading-6 text-gray-900 dark:text-dark-100">{item.title}</div>
            {item.kind !== "attachment" && (
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-500 dark:text-dark-400">{item.description}</p>
            )}
          </div>

          <TimelineImage item={item} />

          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs font-semibold text-gray-400 dark:border-dark-800 dark:text-dark-500">
            <div className="inline-flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${meta.marker}`} />
              <span>{item.status || meta.label}</span>
            </div>
            <div className="inline-flex items-center gap-1">
              <Clock3 size={13} />
              <span>{formatDate(item.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );

  const body = item.href ? (
    <Link href={item.href} className="block">
      {card}
    </Link>
  ) : card;

  return (
    <div className="relative">
      {body}
    </div>
  );
};

const Timeline = ({
  initialData = null,
  loadTimelineAction = getUserTimelineAction,
  showHeader = true,
  embedded = false,
}: TimelineProps) => {
  const [data, setData] = useState<UserTimelineData | null>(initialData);
  const [items, setItems] = useState(initialData?.items || []);
  const [nextCursor, setNextCursor] = useState(initialData?.nextCursor || null);
  const [hasMore, setHasMore] = useState(initialData?.hasMore || false);
  const [activeFilter, setActiveFilter] = useState<UserTimelineFilter>("all");
  const [isPending, startTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const groupedItems = useMemo(() => groupTimelineItems(items), [items]);
  const summary = data?.summary;
  const totalActivity = summary
    ? summary.documentCount + summary.commentCount + summary.attachmentCount + summary.notificationCount
    : 0;
  const filterTabs: Array<{
    key: UserTimelineFilter;
    label: string;
    count: number;
    activeClass: string;
  }> = [
    { key: "all", label: "전체", count: totalActivity, activeClass: "bg-gray-950 text-white" },
    { key: "document", label: "게시글", count: summary?.documentCount || 0, activeClass: "bg-cyan-500 text-white" },
    { key: "comment", label: "댓글", count: summary?.commentCount || 0, activeClass: "bg-violet-500 text-white" },
    { key: "attachment", label: "파일", count: summary?.attachmentCount || 0, activeClass: "bg-emerald-500 text-white" },
    { key: "notification", label: "알림", count: summary?.notificationCount || 0, activeClass: "bg-amber-500 text-white" },
  ];

  useEffect(() => {
    setActiveFilter("all");

    if (initialData) {
      setData(initialData);
      setItems(initialData.items);
      setNextCursor(initialData.nextCursor);
      setHasMore(initialData.hasMore);
      return;
    }

    let isMounted = true;

    startTransition(async () => {
      try {
        const result = await loadTimelineAction(null, 15, "all");
        if (!isMounted) return;

        if (!result.success || !result.data) {
          setData(null);
          setItems([]);
          setNextCursor(null);
          setHasMore(false);
          return;
        }

        setData(result.data);
        setItems(result.data.items);
        setNextCursor(result.data.nextCursor);
        setHasMore(result.data.hasMore);
      } catch (error) {
        console.error("loadTimelineInitial Error:", error);
        if (!isMounted) return;
        setData(null);
        setItems([]);
        setNextCursor(null);
        setHasMore(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [initialData, loadTimelineAction]);

  const loadMore = () => {
    if (!hasMore || isPending || !nextCursor) return;

    startTransition(async () => {
      try {
        const result = await loadTimelineAction(nextCursor, 15, activeFilter);
        if (!result.success || !result.data) {
          setHasMore(false);
          return;
        }

        const nextData = result.data;
        setItems((prev) => {
          const prevIds = new Set(prev.map((item) => item.id));
          const nextItems = nextData.items.filter((item) => !prevIds.has(item.id));
          return [...prev, ...nextItems];
        });
        setNextCursor(nextData.nextCursor);
        setHasMore(nextData.hasMore);
        setData(nextData);
      } catch (error) {
        console.error("loadMoreTimeline Error:", error);
        setHasMore(false);
      }
    });
  };

  const changeFilter = (filter: UserTimelineFilter) => {
    if (filter === activeFilter || isPending) return;

    setActiveFilter(filter);
    startTransition(async () => {
      try {
        const result = await loadTimelineAction(null, 15, filter);
        if (!result.success || !result.data) {
          setItems([]);
          setNextCursor(null);
          setHasMore(false);
          return;
        }

        setItems(result.data.items);
        setNextCursor(result.data.nextCursor);
        setHasMore(result.data.hasMore);
        setData(result.data);
      } catch (error) {
        console.error("changeTimelineFilter Error:", error);
        setItems([]);
        setNextCursor(null);
        setHasMore(false);
      }
    });
  };

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) loadMore();
    }, { rootMargin: "320px 0px" });

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, isPending, nextCursor]);

  if (!data) {
    return (
      <div className={`${embedded ? "bg-transparent" : "min-h-screen bg-gray-50 dark:bg-dark-950"}`}>
        {showHeader && <HeaderUser />}
        <div className={`${embedded ? "px-4 pb-16 pt-2" : "mx-auto max-w-screen-xl px-3 py-6 md:px-6 md:py-8"}`}>
          <div className="mx-auto flex min-h-80 max-w-3xl items-center justify-center rounded-md border border-gray-200 bg-white text-sm font-semibold text-gray-400 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-500">
            <Loader2 size={18} className="mr-2 animate-spin" />
            타임라인을 불러오는 중
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${embedded ? "bg-transparent" : "min-h-screen bg-gray-50 dark:bg-dark-950"}`}>
      {showHeader && <HeaderUser />}

      <div className={`${embedded ? "px-4 pb-16 pt-2" : "mx-auto max-w-screen-xl px-3 py-6 md:px-6 md:py-8"}`}>
        <section className="rounded-md border border-gray-200 bg-white p-5 shadow-sm shadow-gray-100 dark:border-dark-800 dark:bg-dark-900 dark:shadow-black/20">
          <div className="flex flex-col gap-5 border-b border-gray-200 pb-5 md:flex-row md:items-end md:justify-between dark:border-dark-800">
            <div className="flex items-end gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-full bg-gray-200 ring-4 ring-white shadow-sm shadow-gray-200 dark:bg-dark-800 dark:ring-dark-900 dark:shadow-black/30">
                {data.user.profileImage ? (
                  <img src={data.user.profileImage} alt={data.user.nickName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-gray-500 dark:text-dark-300">
                    {data.user.nickName.slice(0, 1)}
                  </div>
                )}
              </div>
              <div className="pb-1">
                <div className="text-2xl font-black tracking-tight text-gray-950 dark:text-dark-100">{data.user.nickName}</div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm font-semibold text-gray-400">
                  <span>@{data.user.accountId}</span>
                  {data.user.email && (
                    <>
                      <span className="text-gray-300">·</span>
                      <span>{data.user.email}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-md bg-gray-950 px-3 py-2 text-xs font-bold text-white dark:bg-dark-100 dark:text-dark-950">
              <ShieldCheck size={15} />
              {totalActivity} activities
            </div>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto">
            {filterTabs.map((tab) => {
              const active = activeFilter === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => changeFilter(tab.key)}
                  className={`flex min-w-24 cursor-pointer items-center justify-between gap-3 rounded-full px-3 py-2 text-left text-xs font-bold transition-colors ${active ? tab.activeClass : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 dark:bg-dark-900 dark:text-dark-400 dark:hover:bg-dark-800 dark:hover:text-dark-100"}`}
                >
                  <span>{tab.label}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] ${active ? "bg-white/20 text-current" : "bg-white text-gray-400 dark:bg-dark-800 dark:text-dark-400"}`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-5">
          {items.length > 0 ? (
            <div className="space-y-8">
              {Object.entries(groupedItems).map(([date, dateItems]) => (
                <div key={date} className="space-y-4">
                  <div className="sticky top-14 z-10 flex md:top-16">
                    <div className="rounded-full border border-gray-200 bg-white/90 px-2.5 py-1 text-sm mx-auto text-gray-500 shadow-md shadow-gray-950/5 backdrop-blur-lg dark:border-dark-800 dark:bg-dark-900/90 dark:text-dark-300 dark:shadow-black/30">
                      {date}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {dateItems.map((item) => (
                      <TimelineCard key={item.id} item={item} user={data.user} />
                    ))}
                  </div>
                </div>
              ))}

              <div ref={sentinelRef} className="flex min-h-16 items-center justify-center py-4">
                {isPending ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-gray-100 bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-400 shadow-sm shadow-gray-100 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-500 dark:shadow-black/20">
                    <Loader2 size={14} className="animate-spin" />
                    활동을 더 불러오는 중
                  </div>
                ) : hasMore ? (
                  <button
                    type="button"
                    onClick={loadMore}
                    className="cursor-pointer rounded-full border border-gray-100 bg-white px-4 py-2 text-xs font-semibold text-gray-500 shadow-sm shadow-gray-100 transition-colors hover:border-gray-200 hover:bg-gray-50 hover:text-gray-900 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-400 dark:shadow-black/20 dark:hover:border-dark-700 dark:hover:bg-dark-800 dark:hover:text-dark-100"
                  >
                    더 보기
                  </button>
                ) : (
                  <div className="rounded-full bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-400 dark:bg-dark-900 dark:text-dark-500">
                    모든 활동을 확인했습니다.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-gray-300 bg-white p-10 text-center dark:border-dark-700 dark:bg-dark-900">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-gray-100 text-gray-400 dark:bg-dark-800 dark:text-dark-400">
                <Clock3 size={22} />
              </div>
              <div className="mt-4 text-sm font-bold text-gray-900 dark:text-dark-100">아직 기록된 활동이 없습니다.</div>
              <p className="mt-2 text-sm text-gray-500 dark:text-dark-400">게시글, 댓글, 첨부파일 활동이 생기면 이곳에 시간순으로 표시됩니다.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Timeline;
