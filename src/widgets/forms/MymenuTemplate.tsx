"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Bell, Zap, Trash2, CheckCheck, Loader2, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";

import { hasClientSession } from "@/core/utils/auth/clientAuth";

// dayjs 설정
dayjs.extend(relativeTime);
dayjs.locale("ko");

interface DBNotification {
  uuid: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  metadata?: any;
}

const MymenuTemplate = () => {
  const [notifications, setNotifications] = useState<DBNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // 🌟 1. 어떤 그룹이 펼쳐져 있는지 관리하는 상태
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const hasSession = await hasClientSession();
      if (!hasSession) {
        setNotifications([]);
        return;
      }

      const res = await fetch('/api/notifications/unread');
      if (!res.ok) throw new Error("데이터 로드 실패");
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  // 🌟 2. [핵심 로직] 알림 그룹화 (제목 기준)
  const groupedNotifications = React.useMemo(() => {
    const groups: { [key: string]: DBNotification[] } = {};

    notifications.forEach((noti) => {
      // JSON 문자열로 들어올 경우를 대비해 파싱 로직 추가
      let meta = noti.metadata;
      if (typeof meta === 'string') {
        try {
          meta = JSON.parse(meta);
        } catch {
          meta = null;
        }
      }

      // 메타데이터의 groupKey가 있으면 그걸 쓰고, 없으면 제목을 기준으로 뭉칩니다.
      const groupKey = meta?.groupKey || noti.title || "기타";

      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(noti);
    });

    return groups;
  }, [notifications]);

  // 그룹 펼치기/접기 토글
  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupKey) ? prev.filter(k => k !== groupKey) : [...prev, groupKey]
    );
  };

  // 개별 읽음/삭제 및 전체 처리 함수들 (기존 로직 유지)
  const handleRead = async (uuid: string) => {
    if (!(await hasClientSession())) return;

    setNotifications(prev => prev.filter(n => n.uuid !== uuid));
    await fetch(`/api/notifications/${uuid}/read`, { method: 'PATCH' });

    window.dispatchEvent(new Event('refresh-unread'));
  };

  const handleDelete = async (uuid: string) => {
    if (!(await hasClientSession())) return;

    setNotifications(prev => prev.filter(n => n.uuid !== uuid));
    await fetch(`/api/notifications/${uuid}`, { method: 'DELETE' });

    window.dispatchEvent(new Event('refresh-unread'));
  };

  const handleReadAll = async () => {
    if (!(await hasClientSession())) return;

    setNotifications([]);
    await fetch('/api/notifications/read-all', { method: 'POST' });

    window.dispatchEvent(new Event('refresh-unread'));
  };

  const handleDeleteAll = async () => {
    if (!(await hasClientSession())) return;

    setNotifications([]);
    await fetch('/api/notifications/delete-all', { method: 'POST' });

    window.dispatchEvent(new Event('refresh-unread'));
  };

  return (
    <div className="h-full w-full flex flex-col bg-white dark:bg-black/20 backdrop-blur-[50px] font-sans overflow-hidden relative">

      {/* 🍎 macOS 헤더 */}
      <header className="px-8 pt-10 pb-6 shrink-0 z-10">
        <div className="flex justify-between items-end">
          <div>
            <div className="text-[28px] font-extrabold text-black/90 dark:text-white/95 tracking-tight">알림 센터</div>
            <p className="text-[12px] font-bold text-black/30 dark:text-white/30 uppercase tracking-[0.2em] mt-1">
              {dayjs().format('MMMM D일 dddd')}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleReadAll} className="p-2 bg-white/50 dark:bg-white/10 hover:bg-white/80 rounded-full transition-all text-gray-500 hover:text-blue-600 shadow-sm shadow-gray-950/20 border border-white/40 cursor-pointer"><CheckCheck size={16} /></button>
            <button onClick={handleDeleteAll} className="p-2 bg-white/50 dark:bg-white/10 hover:bg-white/80 rounded-full transition-all text-gray-500 hover:text-red-500 shadow-sm shadow-gray-950/20 border border-white/40 cursor-pointer"><Trash2 size={16} /></button>
          </div>
        </div>
      </header>

      {/* 🍎 알림 리스트 영역 (스택 디자인) */}
      <div className="flex-1 overflow-y-auto px-6 pb-10 custom-scrollbar space-y-8">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="flex h-40 items-center justify-center"><Loader2 size={24} className="animate-spin text-gray-300" /></div>
          ) : Object.keys(groupedNotifications).length > 0 ? (
            <>
              {
                Object.entries(groupedNotifications).map(([groupKey, items]) => {
                  const isExpanded = expandedGroups.includes(groupKey);
                  const displayItems = isExpanded ? items : [items[0]];

                  return (
                    <div key={groupKey} className="relative">
                      {/* 🌟 3. 스택 효과 디자인 (겹쳐 보이기) */}
                      {!isExpanded && items.length > 1 && (
                        <>
                          <div className="absolute -bottom-1.5 left-3 right-3 h-12 bg-gray-50 dark:bg-white/5 border border-white/60 shadow-sm rounded-[24px] -z-1 scale-[0.97] blur-[0.5px]" />
                          <div className="absolute -bottom-3 left-6 right-6 h-12 bg-gray-100 dark:bg-white/5 border border-white/40 shadow-sm rounded-[24px] -z-10 scale-[0.94] blur-[0.2px]" />
                          {/*<div className="absolute -bottom-3 left-6 right-6 h-12 bg-white/10 dark:bg-white/5 border border-white/10 -z-20 scale-[0.94] blur-[1px]" />*/}
                        </>
                      )}

                      {/* 🌟 4. 그룹 헤더 및 카드 렌더링 */}
                      <div className="flex flex-col">
                        <div className="flex justify-between items-center px-3 mb-2">
                          <span className="text-[11px] font-bold text-black/30 dark:text-white/30 uppercase tracking-wider">{groupKey}</span>
                          {items.length > 1 && (
                            <button onClick={() => toggleGroup(groupKey)} className="text-[11px] font-bold text-gray-900/40 flex items-center gap-1 bg-gray-950/5 dark:bg-gray-500/10 px-2 py-0.5 rounded-full">
                              {isExpanded ? "접기" : `${items.length - 1}개 더보기`}
                            </button>
                          )}
                        </div>

                        <div className="space-y-2">
                          <AnimatePresence>
                            {displayItems.map((noti) => (
                              <motion.div
                                key={noti.uuid}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="group relative bg-white dark:bg-white/5 backdrop-blur-xl border border-white/80 dark:border-white/10 rounded-[24px] p-4 shadow-md hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
                              >
                                <div className="flex gap-4" onClick={() => isExpanded ? null : toggleGroup(groupKey)}>
                                  <div className="shrink-0">
                                    {noti.imageUrl ? (
                                      <img src={noti.imageUrl} className="w-10 h-10 rounded-[12px] object-cover" alt="" />
                                    ) : (
                                      <div className="w-10 h-10 bg-white dark:bg-white/10 rounded-[12px] flex items-center justify-center border border-black/[0.03]">
                                        <StatusIcon type={noti.type} />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                      <span className="text-[13px] font-bold text-black/80 dark:text-white/90 truncate">{noti.title}</span>
                                      <span className="text-[10px] font-medium text-black/30 dark:text-white/30 whitespace-nowrap ml-2">
                                    {dayjs(noti.createdAt).fromNow()}
                                  </span>
                                    </div>
                                    <p className="text-[12px] text-black/60 dark:text-white/50 leading-snug line-clamp-2">{noti.content}</p>
                                  </div>
                                </div>

                                {/* 호버 시 액션 버튼 */}
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                                  <button onClick={(e) => { e.stopPropagation(); handleRead(noti.uuid); }} className="p-1.5 bg-white/90 dark:bg-white/20 rounded-full shadow-sm text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"><CheckCheck size={12} /></button>
                                  <button onClick={(e) => { e.stopPropagation(); handleDelete(noti.uuid); }} className="p-1.5 bg-white/90 dark:bg-white/20 rounded-full shadow-sm text-red-500 hover:bg-red-600 hover:text-white transition-colors"><X size={12} /></button>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  );
                })
              }

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pt-4 pb-2 flex justify-center"
              >
                <Link
                  href="/user/notifications" // 실제 히스토리 페이지 경로로 수정하세요
                  className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/30 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 border border-white/40 dark:border-white/10 transition-all shadow-sm"
                >
                  <span className="text-[12px] font-bold text-black/40 dark:text-white/40 group-hover:text-black/60 dark:group-hover:text-white/60">
                    이전 알림 및 전체 보기
                  </span>
                  <ChevronDown size={14} className="text-black/30 dark:text-white/30 -rotate-90 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </motion.div>
            </>
          ) : (
            <>
              <div className="h-64 flex flex-col items-center justify-center text-black/30 dark:text-white/30">
                <Bell size={48} strokeWidth={1} /><p className="mt-4 text-[13px] font-medium uppercase tracking-widest">새로운 알림 없음</p>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pt-4 pb-2 flex justify-center"
              >
                <Link
                  href="/user/notifications" // 실제 히스토리 페이지 경로로 수정하세요
                  className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/30 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 border border-white/40 dark:border-white/10 transition-all shadow-sm"
                >
                  <span className="text-[12px] font-bold text-black/40 dark:text-white/40 group-hover:text-black/60 dark:group-hover:text-white/60">
                    이전 알림 및 전체 보기
                  </span>
                  <ChevronDown size={14} className="text-black/30 dark:text-white/30 -rotate-90 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const StatusIcon = ({ type }: { type: string }) => {
  const iconSize = 18;
  if (type === 'success') return <Zap size={iconSize} className="text-blue-500 fill-blue-500/20" />;
  if (type === 'error') return <Zap size={iconSize} className="text-red-500 fill-red-500/20" />;
  if (type === 'warning') return <Zap size={iconSize} className="text-amber-500 fill-amber-500/20" />;
  return <Bell size={iconSize} className="text-gray-400" />;
};

export default MymenuTemplate;
