import { FileText, Globe, LayoutGrid, Map, Settings } from "lucide-react";

import { defineAdminLayout, defineModule } from "@/core/registry/define";
import AdminDashboard from "@/layouts/admin/default/Dashboard";
import AdminLayout from "@/layouts/admin/default/AdminLayout";

export const adminModule = defineModule({
  key: "admin",
  label: "관리자",
  description: "관리자 대시보드, 콘텐츠 관리, 사이트 관리, 설정 메뉴를 제공합니다.",
  admin: {
    menu: [
      {
        id: "dashboard",
        href: "/admin",
        icon: <LayoutGrid size={18} />,
        label: "Dashboard",
        order: 10,
      },
      {
        id: "content",
        icon: <FileText size={18} />,
        label: "콘텐츠 관리",
        order: 40,
        items: [
          { label: "전체 게시글", href: "/admin/content/documents" },
          { label: "댓글 관리", href: "/admin/content/comments" },
          { label: "첨부파일 관리", href: "/admin/content/attachments" },
          { label: "신고 관리", href: "/admin/content/reports" },
        ],
      },
      {
        id: "site",
        icon: <Map size={18} />,
        label: "사이트 관리",
        order: 50,
        items: [
          { label: "사이트맵", href: "/admin/site/sitemap" },
        ],
      },
      {
        id: "settings",
        icon: <Settings size={18} />,
        label: "Settings",
        order: 60,
        items: [
          { label: "사이트 기본정보", href: "/admin/settings" },
          { label: "SEO 기본설정", href: "/admin/settings/seo" },
          { label: "회원/인증 설정", href: "/admin/settings/auth" },
          { label: "업로드 설정", href: "/admin/settings/upload" },
          { label: "알림 설정", href: "/admin/settings/notification" },
        ],
      },
      {
        id: "infra",
        href: "/infra",
        icon: <Globe size={18} />,
        label: "Infrastructure",
        order: 70,
      },
    ],
    breadcrumbs: {
      content: {
        documents: "DOCUMENTS",
        comments: "COMMENTS",
        attachments: "ATTACHMENTS",
        reports: "REPORTS",
      },
      site: {
        sitemap: "SITEMAP",
      },
      settings: {
        index: "GENERAL",
        seo: "SEO",
        auth: "AUTH",
        upload: "UPLOAD",
        notification: "NOTIFICATION",
        advanced: "ADVANCED",
      },
    },
  },
  adminLayouts: [
    defineAdminLayout({
      key: "default",
      label: "기본 관리자",
      description: "Plextype 배포판에 포함되는 안정적인 기본 관리자 화면입니다.",
      component: AdminLayout,
      dashboard: AdminDashboard,
    }),
  ],
});
