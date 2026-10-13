// DashboardPostCreate.tsx (Client Component)
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { savePostsAdminAction } from "@/modules/posts/actions/posts.action";
import type { PostInfoData } from "@/modules/posts/actions/_type";

import PostInfo from "./components/postInfo";
import PostPermissions from "./components/postPermissions";
import Button from "@components/button/Button";
import Alert from "@components/message/Alert";

const DashboardPostCreate = ({
  initialData,
  groupList,
  mid,
}: {
  initialData: any;
  groupList: any[];
  mid: string;
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formMessage, setFormMessage] = useState<{
    type: string;
    message: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null);
  const defaultPostConfig = {
    skin: "default",
    layout: "default",
    listCount: 20,
    pageCount: 10,
    documentLike: false,
    consultingState: false,
    secretPost: false,
  };

  // 💡 유저 UpsertForm처럼 서버에서 받은 데이터로 즉시 상태 초기화!
  const [formData, setFormData] = useState<{ postInfo: PostInfoData }>({
    postInfo: {
      ...initialData,
      config: {
        ...defaultPostConfig,
        ...(initialData.config || {}),
      },
      permissions: initialData.permissions || {
        listPermissions: [],
        readPermissions: [],
        writePermissions: [],
        commentPermissions: [],
      },
    },
  });

  const isUpdateMode = mid !== "create";

  // 통합 핸들러 (config 내부 값 자동 판별)
  const handlePostInfoChange = (val: Partial<PostInfoData> | any) => {
    setFormData((prev) => {
      const nextInfo = { ...prev.postInfo };
      const configKeys = [
        "skin",
        "layout",
        "listCount",
        "pageCount",
        "documentLike",
        "consultingState",
        "secretPost",
      ];

      Object.entries(val).forEach(([key, value]) => {
        if (configKeys.includes(key)) {
          nextInfo.config = { ...nextInfo.config, [key]: value };
        } else {
          (nextInfo as any)[key] = value;
        }
      });
      return { ...prev, postInfo: nextInfo };
    });
  };

  const handlePermissionsChange = (val: PostInfoData["permissions"]) => {
    setFormData((prev) => ({
      ...prev,
      postInfo: { ...prev.postInfo, permissions: val },
    }));
  };

  const handleSubmit = async () => {
    setFormMessage(null);
    setFieldErrors(null);
    setLoading(true);
    const info = formData.postInfo;
    const fd = new FormData();

    if (info.id) fd.append("id", String(info.id));
    fd.append("mid", info.mid);
    fd.append("moduleName", info.moduleName);
    fd.append("moduleDesc", info.moduleDesc || "");
    fd.append("config", JSON.stringify(info.config));
    fd.append("permissions", JSON.stringify(info.permissions));

    try {
      const res = await savePostsAdminAction(fd, "/admin/posts/list");

      if (!res.success) {
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        } else {
          setFormMessage({
            type: res.type || "error",
            message: res.message,
          });
        }

        if (res.fieldErrors) {
          const firstErrorField = Object.keys(res.fieldErrors)[0];

          setTimeout(() => {
            const element = document.getElementById(firstErrorField);
            if (element) {
              element.focus();
              element.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }, 100);
        }

        setLoading(false);
        return;
      }

      alert(
        isUpdateMode
          ? "게시판 설정이 수정되었습니다."
          : "게시판이 등록되었습니다.",
      );

      router.push("/admin/posts/list");

      setLoading(false);
    } catch {
      setFormMessage({ type: "error", message: "시스템 오류가 발생했습니다." });
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {formMessage && (
        <div className="mb-6">
          <Alert message={formMessage.message} type={formMessage.type} />
        </div>
      )}

      <div className="mb-8 flex flex-wrap items-end gap-4">
        <div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
            Board Control / {isUpdateMode ? "Update" : "Create"}
          </div>
          <div className="mt-2 text-lg font-semibold text-gray-700 dark:text-dark-100">
            {isUpdateMode ? "게시판 수정" : "게시판 생성"}
          </div>
          <div className="mt-1 text-sm text-gray-400">
            게시판의 기본 정보, 기능, 접근 권한을 설정합니다.
          </div>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => router.back()}
            fullWidth={false}
            className="border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:border-dark-700 dark:bg-dark-900 dark:text-dark-300 dark:hover:bg-dark-800 dark:hover:text-white"
          >
            뒤로가기
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            isLoading={loading}
            fullWidth={false}
            className="!bg-blue-100 !text-blue-500 hover:!bg-blue-500 hover:!text-white"
          >
            {isUpdateMode ? "저장하기" : "생성하기"}
          </Button>
        </div>
      </div>

      <PostInfo
        id={mid}
        value={formData.postInfo}
        onChange={handlePostInfoChange}
        fieldErrors={fieldErrors}
      />

      <PostPermissions
        id={mid}
        value={formData.postInfo.permissions}
        onChange={handlePermissionsChange}
        groups={groupList}
      />
    </div>
  );
};

export default DashboardPostCreate;
