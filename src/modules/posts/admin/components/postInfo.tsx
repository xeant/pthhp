"use client";

import React from "react";
import { FileText, Heart, Layers, ListChecks, MessageSquareLock } from "lucide-react";

import InputField from "@components/form/InputField";
import type { PostInfoData } from "@/modules/posts/actions/_type";
import { postLayoutOptions, postSkinOptions } from "@extensions";

type PostInfoProps = {
  id?: string;
  value: PostInfoData;
  onChange: (val: Partial<PostInfoData> | any) => void;
  fieldErrors?: Record<string, string> | null;
};

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

const Toggle = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="relative block h-6 w-11 cursor-pointer rounded-full bg-gray-200 transition-colors data-[checked=true]:bg-gray-900 dark:bg-dark-700 dark:data-[checked=true]:bg-dark-100"
      data-checked={checked}
      aria-pressed={checked}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform dark:bg-dark-300 dark:shadow-black/40 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
};

const selectClass =
  "w-full rounded-md border border-gray-200 bg-white px-3 py-3 text-sm text-gray-800 shadow-md shadow-gray-100 outline-none transition-all hover:border-gray-300 focus:border-gray-300 focus:ring-4 focus:ring-gray-200/75 dark:border-dark-700 dark:bg-dark-900 dark:text-dark-100 dark:shadow-none dark:hover:border-dark-600 dark:focus:border-dark-600 dark:focus:ring-dark-800";

const PostInfo: React.FC<PostInfoProps> = ({ id, value, onChange, fieldErrors }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value: inputValue, type } = e.target;
    onChange({ [name]: type === "number" ? Number(inputValue) : inputValue } as any);
  };

  const handleSkinChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ skin: e.target.value || "default" });
  };

  const handleLayoutChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ layout: e.target.value || "default" });
  };

  return (
    <>
      {id && <input type="hidden" name="postId" value={id} />}
      <input type="hidden" name="moduleType" value="posts" />

      <SectionShell icon={<FileText size={13} />} title="게시판 기본설정" description="게시판 주소와 관리자 화면에 표시될 이름입니다.">
        <FieldRow label="게시판 ID" description="URL에 사용되는 영문/숫자 ID입니다.">
          <InputField
            inputTitle="게시판 ID"
            name="mid"
            type="text"
            placeholder="notice"
            value={value.mid || ""}
            onChange={handleInputChange}
            error={fieldErrors?.mid}
            hideLabel
          />
        </FieldRow>

        <FieldRow label="게시판 이름" description="관리자와 사용자 화면에 노출되는 이름입니다.">
          <InputField
            inputTitle="게시판 이름"
            name="moduleName"
            type="text"
            placeholder="공지사항"
            value={value.moduleName || ""}
            onChange={handleInputChange}
            error={fieldErrors?.moduleName}
            hideLabel
          />
        </FieldRow>

        <FieldRow label="게시판 설명" description="관리자 확인용 설명입니다.">
          <InputField
            inputTitle="게시판 설명"
            name="moduleDesc"
            type="text"
            placeholder="게시판 설명"
            value={value.moduleDesc || ""}
            onChange={handleInputChange}
            error={fieldErrors?.moduleDesc}
            hideLabel
          />
        </FieldRow>
      </SectionShell>

      <SectionShell icon={<Layers size={13} />} title="화면 설정" description="게시판을 감싸는 레이아웃과 목록 화면의 스킨입니다.">
        <FieldRow label="게시판 레이아웃" description="게시판 전체 영역을 감싸는 레이아웃입니다.">
          <select
            id="layout"
            name="layout"
            value={value.config.layout || "default"}
            onChange={handleLayoutChange}
            className={selectClass}
          >
            {postLayoutOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="mt-2 text-xs leading-5 text-gray-400">
            {postLayoutOptions.find((option) => option.key === (value.config.layout || "default"))?.description || "등록된 게시판 레이아웃입니다."}
          </div>
        </FieldRow>

        <FieldRow label="목록 스킨" description="게시글 목록을 렌더링하는 스킨입니다.">
          <select
            id="skin"
            name="skin"
            value={value.config.skin || "default"}
            onChange={handleSkinChange}
            className={selectClass}
          >
            {postSkinOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="mt-2 text-xs leading-5 text-gray-400">
            {postSkinOptions.find((option) => option.key === (value.config.skin || "default"))?.description || "등록된 게시판 목록 스킨입니다."}
          </div>
        </FieldRow>

        <FieldRow label="목록/페이지 수" description="한 페이지의 게시글 수와 페이지 네비게이션 개수입니다.">
          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              inputTitle="목록 수"
              name="listCount"
              type="number"
              value={value.config.listCount}
              onChange={handleInputChange}
              hideLabel
            />
            <InputField
              inputTitle="페이지 수"
              name="pageCount"
              type="number"
              value={value.config.pageCount}
              onChange={handleInputChange}
              hideLabel
            />
          </div>
        </FieldRow>
      </SectionShell>

      <SectionShell icon={<ListChecks size={13} />} title="기능 설정" description="게시판별 부가 기능의 사용 여부입니다.">
        <FieldRow label="좋아요 사용" description="게시글 본문에 좋아요 기능을 사용합니다.">
          <div className="flex items-center gap-3">
            <Toggle checked={Boolean(value.config.documentLike)} onChange={(checked) => onChange({ documentLike: checked })} />
            <span className="text-sm text-gray-600 dark:text-dark-400">좋아요 기능</span>
          </div>
        </FieldRow>

        <FieldRow label="상담 기능 사용" description="관리자와 작성자만 글을 볼 수 있는 게시판으로 운영합니다.">
          <div className="flex items-center gap-3">
            <Toggle checked={Boolean(value.config.consultingState)} onChange={(checked) => onChange({ consultingState: checked })} />
            <span className="text-sm text-gray-600 dark:text-dark-400">작성자 전용 목록</span>
          </div>
        </FieldRow>

        <FieldRow label="비밀글 사용" description="작성자가 비밀번호를 설정한 글은 작성자, 관리자, 비밀번호를 아는 사용자만 열람할 수 있습니다.">
          <div className="flex items-center gap-3">
            <Toggle checked={Boolean(value.config.secretPost)} onChange={(checked) => onChange({ secretPost: checked })} />
            <span className="text-sm text-gray-600 dark:text-dark-400">비밀글 허용</span>
          </div>
        </FieldRow>
      </SectionShell>
    </>
  );
};

export default PostInfo;
