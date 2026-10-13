"use client";

import { Activity, FileText, MessageSquare } from "lucide-react";

import CommentList from "@widgets/admin/commentList";
import DocumentList from "@widgets/admin/documentList";

const DefaultAdminDashboard = () => {
  return (
    <div className="mx-auto grid max-w-screen-2xl gap-5">
      <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-dark-800 dark:bg-dark-900">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-gray-400 dark:text-dark-500">
              <Activity size={13} />
              Overview
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-gray-950 dark:text-dark-50">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-dark-400">
              최근 게시글과 댓글 흐름을 빠르게 확인합니다.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <SummaryBadge icon={<FileText size={14} />} label="Posts" />
            <SummaryBadge icon={<MessageSquare size={14} />} label="Comments" />
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="최근 게시글" eyebrow="Content" icon={<FileText size={13} />}>
          <DocumentList />
        </Panel>
        <Panel title="최근 댓글" eyebrow="Community" icon={<MessageSquare size={13} />}>
          <CommentList />
        </Panel>
      </div>
    </div>
  );
};

const SummaryBadge = ({ icon, label }: { icon: React.ReactNode; label: string }) => {
  return (
    <div className="flex min-w-20 items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-500 dark:border-dark-800 dark:text-dark-400">
      {icon}
      {label}
    </div>
  );
};

const Panel = ({
  title,
  eyebrow,
  icon,
  children,
}: {
  title: string;
  eyebrow: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <section className="min-h-[420px] rounded-2xl border border-gray-200 bg-white p-6 dark:border-dark-800 dark:bg-dark-900">
      <div className="mb-5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-dark-500">
        {icon}
        {eyebrow}
      </div>
      <h2 className="mb-5 text-base font-bold text-gray-900 dark:text-dark-100">{title}</h2>
      {children}
    </section>
  );
};

export default DefaultAdminDashboard;
