"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

interface Group {
  id: number;
  groupName: string;
  groupTitle: string;
  groupDesc?: string;
}

interface Permission {
  subjectType: string;
  subjectId?: number | null;
}

interface PostPermissionsProps {
  id: string | number;
  value: Record<string, Permission[]>;
  groups: Group[];
  onChange: (val: Record<string, Permission[]>) => void;
}

const SectionShell = ({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}) => {
  return (
    <section className="grid grid-cols-4 gap-8 border-t border-gray-200 py-10 first:border-t-0 dark:border-dark-800">
      <div className="col-span-4 lg:col-span-1">
        <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-gray-400">
          {icon}
          Board
        </div>
        <div className="mt-3 text-lg font-semibold text-gray-600 dark:text-dark-100">{title}</div>
        {description && <div className="mt-2 text-sm leading-6 text-gray-400">{description}</div>}
      </div>
      <div className="col-span-4 lg:col-span-3">
        <div className="grid gap-2">{children}</div>
      </div>
    </section>
  );
};

const FieldRow = ({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="rounded-md p-5 transition-colors hover:bg-gray-50 dark:hover:bg-dark-900">
      <div className="mb-4">
        <div className="text-sm font-medium text-black dark:text-dark-100">{label}</div>
        {description && <div className="mt-1 text-xs leading-5 text-gray-400">{description}</div>}
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
};

const PostPermissions: React.FC<PostPermissionsProps> = ({
  value,
  groups,
  onChange,
}) => {
  const [localPermissions, setLocalPermissions] = useState(value);

  useEffect(() => {
    setLocalPermissions(value);
  }, [value]);

  const permissionGroups = [
    { label: "비회원", value: "guest" },
    { label: "로그인 사용자", value: "member" },
    { label: "관리자", value: "admin" },
  ];

  const permissions = [
    { label: "목록 조회", description: "게시판 목록 접근 권한입니다.", permissionsType: "listPermissions" },
    { label: "본문 열람", description: "게시글 상세 페이지 접근 권한입니다.", permissionsType: "readPermissions" },
    { label: "글 작성", description: "게시글 작성 권한입니다.", permissionsType: "writePermissions" },
    { label: "댓글 작성", description: "댓글과 답글 작성 권한입니다.", permissionsType: "commentPermissions" },
  ];

  function togglePermission(
    permissionType: string,
    subjectType: string,
    subjectId: number | null = null,
  ) {
    const current = value[permissionType] ?? [];

    const exists = current.some(
      (p) =>
        p.subjectType === subjectType &&
        Number(p.subjectId) === Number(subjectId),
    );

    const updated = exists
      ? current.filter(
        (p) =>
          !(
            p.subjectType === subjectType &&
            Number(p.subjectId) === Number(subjectId)
          ),
      )
      : [...current, { subjectType, subjectId }];

    onChange({ ...value, [permissionType]: updated });
  }

  const PermissionChip = ({
    label,
    checked,
    onClick,
  }: {
    label: string;
    checked: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
        checked
          ? "border-gray-300 bg-gray-100 text-gray-900 dark:border-dark-500 dark:bg-dark-800 dark:text-dark-100"
          : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-900 dark:border-dark-700 dark:bg-dark-900 dark:text-dark-400 dark:hover:border-dark-500 dark:hover:text-dark-100"
      }`}
    >
      <span className={`h-3 w-3 rounded-sm border ${checked ? "border-gray-900 bg-gray-900 dark:border-dark-100 dark:bg-dark-100" : "border-gray-300 dark:border-dark-600"}`} />
      {label}
    </button>
  );

  return (
    <SectionShell icon={<ShieldCheck size={13} />} title="권한 설정" description="기능별 접근 가능한 대상을 설정합니다.">
      {permissions.map(({ label, description, permissionsType }) => (
        <FieldRow key={permissionsType} label={label} description={description}>
          <div className="flex flex-wrap gap-3">
            {permissionGroups.map(({ label: groupLabel, value: groupValue }) => (
              <PermissionChip
                key={groupValue}
                label={groupLabel}
                checked={(localPermissions[permissionsType] ?? []).some(
                  (p) => p.subjectType === groupValue && p.subjectId === null,
                )}
                onClick={() => togglePermission(permissionsType, groupValue, null)}
              />
            ))}

            {groups.map((group) => (
              <PermissionChip
                key={group.id}
                label={group.groupTitle}
                checked={(localPermissions[permissionsType] ?? []).some(
                  (p) =>
                    p.subjectType === "group" &&
                    Number(p.subjectId) === Number(group.id),
                )}
                onClick={() => togglePermission(permissionsType, "group", Number(group.id))}
              />
            ))}
          </div>
        </FieldRow>
      ))}
    </SectionShell>
  );
};

export default PostPermissions;
