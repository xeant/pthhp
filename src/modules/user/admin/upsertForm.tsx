"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IdCard, LockKeyhole, Mail, ShieldCheck, UserRound, UsersRound } from "lucide-react";

import Alert from "@components/message/Alert";
import Button from "@components/button/Button";
import InputField from "@components/form/InputField";
import { saveUserAction } from "@/modules/user/actions/user.action";

type UpsertFormProps = {
  user?: any;
  groupList: any[];
};

const textareaClass =
  "w-full resize-y rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm leading-6 text-gray-700 outline-none transition-colors placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400 dark:border-dark-700 dark:bg-dark-900 dark:text-dark-100 dark:placeholder:text-dark-500";

const selectClass =
  "w-full rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition-colors hover:border-gray-300 focus:border-gray-400 dark:border-dark-700 dark:bg-dark-900 dark:text-dark-100";

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
          User
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
      className="relative block h-6 w-11 cursor-pointer rounded-full bg-gray-200 transition-colors data-[checked=true]:bg-cyan-500 dark:bg-dark-700 dark:data-[checked=true]:bg-cyan-500"
      data-checked={checked}
      aria-pressed={checked}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
};

const UpsertForm = ({ user, groupList }: UpsertFormProps) => {
  const router = useRouter();
  const [formMessage, setFormMessage] = useState<{ type: string; message: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null);

  const initialGroups = user?.userGroups?.map((ug: any) => ug.group.id) ?? [];
  const [selectedGroups, setSelectedGroups] = useState<number[]>(initialGroups);
  const [isAdmin, setIsAdmin] = useState(user?.isAdmin ?? false);
  const [isPending, startTransition] = useTransition();

  const refAccountId = useRef<HTMLInputElement>(null);
  const refNickName = useRef<HTMLInputElement>(null);
  const refPassword = useRef<HTMLInputElement>(null);
  const refEmail = useRef<HTMLInputElement>(null);

  const isUpdateMode = !!user;

  const handleGroupChange = (groupId: number) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId],
    );
  };

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormMessage(null);
    setFieldErrors(null);

    const formData = new FormData(e.currentTarget);
    formData.append("isAdmin", isAdmin.toString());
    selectedGroups.forEach((id) => formData.append("groups[]", String(id)));

    startTransition(async () => {
      const res = await saveUserAction(formData);

      if (!res.success) {
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        } else {
          setFormMessage({ type: res.type || "error", message: res.message });
        }

        if (res.fieldErrors) {
          if (res.fieldErrors.accountId) refAccountId.current?.focus();
          else if (res.fieldErrors.email_address) refEmail.current?.focus();
          else if (res.fieldErrors.nickName) refNickName.current?.focus();
          else if (res.fieldErrors.password) refPassword.current?.focus();
        }
        return;
      }

      alert(isUpdateMode ? "성공적으로 수정되었습니다." : "성공적으로 등록되었습니다.");
      if (isUpdateMode) {
        router.refresh();
      } else {
        router.push("/admin/user/list");
      }
    });
  };

  return (
    <form onSubmit={submitHandler} className="dark:text-dark-100">
      {formMessage && (
        <div className="mb-6">
          <Alert type={formMessage.type} message={formMessage.message} />
        </div>
      )}

      <input type="hidden" name="id" value={user?.id || ""} />

      <div className="mb-8 flex flex-wrap items-end gap-4">
        <div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
            User Control / {isUpdateMode ? "Update" : "Create"}
          </div>
          <div className="mt-2 text-lg font-semibold text-gray-700 dark:text-dark-100">
            {isUpdateMode ? "회원 수정" : "회원 추가"}
          </div>
          <div className="mt-1 text-sm text-gray-400">
            {isUpdateMode ? "회원의 기본 정보와 권한을 수정합니다." : "관리자가 새 회원 계정을 생성합니다."}
          </div>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <Button type="button" onClick={() => router.back()} fullWidth={false} className="border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:border-dark-700 dark:bg-dark-900 dark:text-dark-300 dark:hover:bg-dark-800 dark:hover:text-white">
            뒤로가기
          </Button>
          <Button
            isLoading={isPending}
            fullWidth={false}
            type="submit"
            className="!bg-blue-100 !text-blue-500 hover:!bg-blue-500 hover:!text-white"
          >
            {isUpdateMode ? "수정하기" : "등록하기"}
          </Button>
        </div>
      </div>

      <SectionShell icon={<UserRound size={13} />} title="회원 기본설정" description="로그인과 식별에 사용하는 핵심 정보입니다.">
        <FieldRow label="아이디" description="기본 로그인 계정으로 사용됩니다.">
          <InputField
            inputTitle="아이디"
            name="accountId"
            type="text"
            defaultValue={user?.accountId || ""}
            icon={<IdCard size={18} />}
            ref={refAccountId}
            readOnly={isUpdateMode}
            error={fieldErrors?.accountId}
            hideLabel
          />
        </FieldRow>

        <FieldRow label="이메일" description="계정 안내와 찾기 기능에 사용할 수 있습니다.">
          <InputField
            inputTitle="이메일"
            name="email_address"
            type="email"
            defaultValue={user?.email_address || ""}
            icon={<Mail size={18} />}
            ref={refEmail}
            error={fieldErrors?.email_address}
            hideLabel
          />
        </FieldRow>

        <FieldRow label="닉네임" description="게시글과 댓글 작성자명으로 노출됩니다.">
          <InputField
            inputTitle="닉네임"
            name="nickName"
            type="text"
            defaultValue={user?.nickName || ""}
            icon={<UserRound size={18} />}
            ref={refNickName}
            error={fieldErrors?.nickName}
            hideLabel
          />
        </FieldRow>

        <FieldRow label="비밀번호" description={isUpdateMode ? "변경할 때만 입력합니다." : "신규 계정 생성 시 필수입니다."}>
          <InputField
            inputTitle="비밀번호"
            name="password"
            type="password"
            placeholder={isUpdateMode ? "변경 시에만 입력하세요" : "비밀번호를 입력하세요"}
            icon={<LockKeyhole size={18} />}
            ref={refPassword}
            error={fieldErrors?.password}
            hideLabel
          />
        </FieldRow>
      </SectionShell>

      <SectionShell icon={<ShieldCheck size={13} />} title="권한 설정" description="관리자 권한과 회원 그룹을 지정합니다.">
        <FieldRow label="계정 상태" description="승인 대기나 차단 상태인 일반 회원은 로그인할 수 없습니다. 승인할 회원은 즉시 활성화로 변경하세요.">
          <select className={selectClass} name="status" defaultValue={user?.status || "active"}>
            <option value="active">즉시 활성화</option>
            <option value="pending">승인 대기</option>
            <option value="blocked">차단 상태</option>
          </select>
        </FieldRow>

        <FieldRow label="관리자 설정" description="관리자 페이지 접근 권한을 부여합니다.">
          <div className="flex items-center gap-3">
            <Toggle checked={isAdmin} onChange={setIsAdmin} />
            <span className="text-sm text-gray-600 dark:text-dark-300">관리자 권한</span>
          </div>
        </FieldRow>

        <FieldRow label="그룹 설정" description="회원은 여러 그룹에 동시에 속할 수 있습니다.">
          <div className="flex flex-wrap gap-3">
            {groupList.map((group) => {
              const checked = selectedGroups.includes(group.id);
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => handleGroupChange(group.id)}
                  className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                    checked
                      ? "border-blue-200 bg-blue-50 text-blue-600 dark:border-cyan-500/40 dark:bg-cyan-500/10 dark:text-cyan-300"
                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-900 dark:border-dark-700 dark:bg-dark-900 dark:text-dark-300 dark:hover:border-dark-600 dark:hover:text-dark-100"
                  }`}
                >
                  <span className={`h-3 w-3 rounded-sm border ${checked ? "border-blue-500 bg-blue-500" : "border-gray-300"}`} />
                  {group.groupTitle}
                </button>
              );
            })}
          </div>
        </FieldRow>
      </SectionShell>

      <SectionShell icon={<UsersRound size={13} />} title="운영 메모" description="관리자만 참고하는 내부 기록입니다.">
        <FieldRow label="메모">
          <textarea
            name="memo"
            defaultValue={user?.memo || ""}
            className={textareaClass}
            rows={4}
            placeholder="회원 관리에 필요한 메모"
          />
        </FieldRow>
      </SectionShell>
    </form>
  );
};

export default UpsertForm;
