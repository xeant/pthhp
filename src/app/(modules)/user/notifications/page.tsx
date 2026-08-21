"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Search, Filter, Calendar, BellOff, MoreVertical, Trash2, X, CheckCheck, Bell, Zap, ChevronDown, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";

import { hasClientSession } from "@/core/utils/auth/clientAuth";

dayjs.extend(isToday);
dayjs.extend(isYesterday);

const NotificationPage = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [fetchingMore, setFetchingMore] = useState(false); // 추가 데이터 로딩 상태
  const [page, setPage] = useState(1); // 현재 페이지
  const [hasMore, setHasMore] = useState(true); // 더 가져올 데이터가 있는지 여부
  const LIMIT = 10; // 한 페이지당 가져올 개수

  // 🌟 [추가] 데이터 가져오기 함수 (새로고침 시 재사용)
  const fetchHistory = async (targetPage: number) => {
    try {
      targetPage === 1 ? setLoading(true) : setFetchingMore(true);

      const hasSession = await hasClientSession();
      if (!hasSession) {
        setNotifications([]);
        setHasMore(false);
        return;
      }

      const res = await fetch(`/api/notifications/history?page=${targetPage}&limit=${LIMIT}`);
      if (!res.ok) throw new Error("데이터 로드 실패");

      const newData = await res.json();

      if (Array.isArray(newData)) {
        if (newData.length < LIMIT) setHasMore(false);

        // 데이터 상태 업데이트
        setNotifications(prev => {
          const updatedList = targetPage === 1 ? newData : [...prev, ...newData];
          return updatedList;
        });

        // 🌟 [핵심] 데이터를 성공적으로 가져왔다면 "읽음" 처리 신호 보내기
        if (newData.length > 0) {
          await markAllAsRead();
        }
      }
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  };

  useEffect(() => { fetchHistory(1); }, []);

  // 🌟 [추가] 더보기 버튼 클릭 핸들러
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchHistory(nextPage);
  };

  const markAllAsRead = async () => {
    // 1. 로컬 상태 업데이트 (화면에서 파란 점 즉시 제거)
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

    // 2. 서버 DB 업데이트 (POST /api/notifications/read-all)
    try {
      if (!(await hasClientSession())) return;

      const res = await fetch('/api/notifications/read-all', { method: 'POST' });
      if (!res.ok) throw new Error("전체 읽음 처리 실패");

      window.dispatchEvent(new Event('refresh-unread'));
    } catch (error) {
      console.error("전체 읽음 처리 실패:", error);
    }
  };


  // 🌟 [추가] 개별 삭제 로직
  const handleDelete = async (uuid: string) => {
    if (!(await hasClientSession())) return;

    setNotifications(prev => prev.filter(n => n.uuid !== uuid)); // 낙관적 업데이트
    const res = await fetch(`/api/notifications/${uuid}`, { method: 'DELETE' });
    if (!res.ok) throw new Error("삭제 실패");

    window.dispatchEvent(new Event('refresh-unread'));
  };

  // 🌟 [추가] 전체 삭제 로직
  const handleDeleteAll = async () => {
    if (!confirm("모든 알림 기록을 영구적으로 삭제하시겠습니까?")) return;
    if (!(await hasClientSession())) return;

    setNotifications([]);
    const res = await fetch('/api/notifications/delete-all', { method: 'POST' });
    if (!res.ok) throw new Error("전체 삭제 실패");

    window.dispatchEvent(new Event('refresh-unread'));
  };

  // 🌟 [추가] 개별 읽음 처리 (히스토리 페이지에서도 읽음 처리가 필요할 경우)
  const handleRead = async (uuid: string) => {
    if (!(await hasClientSession())) return;

    setNotifications(prev => prev.map(n => n.uuid === uuid ? { ...n, isRead: true } : n));
    const res = await fetch(`/api/notifications/${uuid}/read`, { method: 'PATCH' });
    if (!res.ok) throw new Error("읽음 처리 실패");

    window.dispatchEvent(new Event('refresh-unread'));
  };

  const dateGroupedNotifications = useMemo(() => {
    const groups: { [key: string]: any[] } = { "오늘": [], "어제": [], "이전 알림": [] };
    notifications
      .filter(n => n.content.includes(searchQuery) || n.title?.includes(searchQuery))
      .filter(n => filterType === "all" || n.type === filterType)
      .forEach(noti => {
        const date = dayjs(noti.createdAt);
        if (date.isToday()) groups["오늘"].push(noti);
        else if (date.isYesterday()) groups["어제"].push(noti);
        else groups["이전 알림"].push(noti);
      });
    return groups;
  }, [notifications, searchQuery, filterType]);

  const StatusIcon = ({ type }: { type: string }) => {
    const iconSize = 18;

    // 성공: 파란색 번개
    if (type === 'success') {
      return <Zap size={iconSize} className="text-blue-500 fill-blue-500/20" />;
    }

    // 에러: 빨간색 번개
    if (type === 'error') {
      return <Zap size={iconSize} className="text-red-500 fill-red-500/20" />;
    }

    // 경고: 주황색 번개
    if (type === 'warning') {
      return <Zap size={iconSize} className="text-amber-500 fill-amber-500/20" />;
    }

    // 기본(info 등): 회색 종 모양
    return <Bell size={iconSize} className="text-gray-400" />;
  };

  return (
    <div className="min-h-screen p-8 font-sans ">
      <div className="max-w-4xl mx-auto">

        {/* 🍎 헤더: 제목 + 전체 삭제 버튼 */}
        <header className="mb-10 flex justify-between items-end">
          <div>
            <div className="text-[32px] font-extrabold tracking-tight text-black/90 dark:text-white/90">알림 기록</div>
            <p className="text-black/40 dark:text-white/40 text-sm mt-1">알림을 관리하거나 삭제할 수 있습니다.</p>
          </div>

          {/* 전체 삭제 버튼 추가 */}
          {notifications.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all cursor-pointer "
            >
              <Trash2 size={16} />
              전체 기록 삭제
            </button>
          )}
        </header>

        {/* 필터 탭 (기존 유지) */}
        <nav className="flex gap-6 mb-8 border-b border-black/5 dark:border-white/5">
          {['all', 'info', 'success', 'warning', 'error'].map((t) => (
            <button key={t} onClick={() => setFilterType(t)} className={`text-sm font-bold capitalize pb-2 transition-all cursor-pointer relative ${filterType === t ? "text-blue-500" : "text-black/30 dark:text-white/30"}`}>
              {t === 'all' ? '전체' : t}
              {filterType === t && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />}
            </button>
          ))}
        </nav>

        {/* 알림 리스트 */}
        <div className="space-y-12">
          {loading && page === 1 ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-300" /></div>
          ) : (
            <>
          {Object.entries(dateGroupedNotifications).map(([dateLabel, items]) => (
            items.length > 0 && (
              <section key={dateLabel}>
                <div className="flex items-center gap-2 mb-4 text-black/30 dark:text-white/30">
                  <Calendar size={14} />
                  <div className="text-[12px] font-bold uppercase tracking-widest">{dateLabel}</div>
                </div>

                <div className="grid gap-3">
                  <AnimatePresence mode="popLayout">
                    {items.map((noti) => (
                      <motion.div
                        key={noti.uuid}
                        layout
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, x: 20 }} // 삭제 시 오른쪽으로 슥 밀려나는 효과
                        className="group flex items-center gap-4 p-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg transition-all relative"
                      >
                        <div className="w-10 h-10 rounded-[12px] bg-gray-50 dark:bg-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                          {noti.imageUrl ? (
                            <img src={noti.imageUrl} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <StatusIcon type={noti.type} />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div className="text-[14px] font-bold text-black/80 dark:text-white/90">
                              {/* 안 읽은 알림은 파란 점(Dot) 표시 */}
                              {!noti.isRead && <span className="inline-block w-2 h-2 bg-rose-500 rounded-full mr-2 mb-0.5" />}
                              {noti.title}
                            </div>
                            <span className="text-[11px] text-black/20 dark:text-white/20">{dayjs(noti.createdAt).format('A h:mm')}</span>
                          </div>
                          <p className="text-[13px] text-black/50 dark:text-white/50 line-clamp-1">{noti.content}</p>
                        </div>

                        {/* 🌟 호버 액션 버튼 (삭제/읽음) */}
                        <div className="opacity-0 group-hover:opacity-100 transition-all flex gap-1">
                          {!noti.isRead && (
                            <button onClick={() => handleRead(noti.uuid)} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-500 rounded-full"><CheckCheck size={16} /></button>
                          )}
                          <button onClick={() => handleDelete(noti.uuid)} className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 rounded-full"><X size={16} /></button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            )
          ))}

              {hasMore && notifications.length > 0 && (
                <div className="flex justify-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={fetchingMore}
                    className="group flex items-center gap-2 px-6 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {fetchingMore ? (
                      <Loader2 size={18} className="animate-spin text-blue-500" />
                    ) : (
                      <>
                        <span className="text-[12px] text-black/60 dark:text-white/60">이전 알림 더보기</span>
                        <ChevronDown size={16} className="text-black/30 group-hover:translate-y-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              )}
          </>
          )}

          {!loading && notifications.length === 0 && (
            <div className="py-20 flex flex-col items-center text-black/20 dark:text-white/20">
              <BellOff size={48} strokeWidth={1} /><p className="mt-4 font-medium">기록된 알림이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
