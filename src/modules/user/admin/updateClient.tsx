"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Alert from "@components/message/Alert";

import { saveUserAction } from "@/modules/user/actions/user.action";
import InputField from "@components/form/InputField";
import Button from "@components/button/Button";

// 🎨 아이콘 정의
const UserIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);

const NicknameIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
  </svg>
);

const LockIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
  </svg>
);

const UpdateFormClient = ({ user, groupList }) => {
  const router = useRouter();
  const [error, setError] = useState<{ type: string; message: string; element?: string } | null>(null);
  const initialGroups = user?.userGroups?.map((ug) => ug.group.id) ?? [];
  const [selectedGroups, setSelectedGroups] = useState(initialGroups);
  const [isAdmin, setIsAdmin] = useState(user?.isAdmin ?? false);
  const [isPending, startTransition] = useTransition();

  const refAccountId = useRef<HTMLInputElement>(null);
  const refNickName = useRef<HTMLInputElement>(null);
  const refPassword = useRef<HTMLInputElement>(null);
  const refEmail = useRef<HTMLInputElement>(null);

  const handleGroupChange = (groupId) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId],
    );
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.target);
    formData.append("isAdmin", isAdmin.toString());
    selectedGroups.forEach((id) => formData.append("groups[]", id));

    startTransition(async () => {
      const res = await saveUserAction(formData);

      if (!res.success) { // 실패 시
        setError({ type: res.type || "error", message: res.message });

        // 💡 사용자님의 표준 규약인 `fieldErrors`를 활용하여 포커스 이동!
        if (res.fieldErrors) {
          if (res.fieldErrors.accountId) refAccountId.current?.focus();
          else if (res.fieldErrors.nickName) refNickName.current?.focus();
          else if (res.fieldErrors.password) refPassword.current?.focus();
          else if (res.fieldErrors.email_address) refEmail.current?.focus();
          // 이메일 필드가 있다면 else if (res.fieldErrors.email_address) ...
        }
      } else { // 성공 시
        alert("성공적으로 수정되었습니다.");
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={submitHandler}>
      {/* 💡 에러 발생 시 Alert 컴포넌트 출력 */}
      {error && <Alert type={error.type} message={error.message} />}
      <input type="hidden" name="id" value={user.id} />
      {/* 회원 기본설정 */}
      <div className="grid grid-cols-4 gap-8 py-10">
        <div className="col-span-1">
          <div className="text-lg font-semibold text-gray-600 mb-3">
            회원 기본설정
          </div>
          <div className="text-gray-400 text-sm">
            회원의 기본설정을 변경합니다.
          </div>
        </div>
        <div className="col-span-3">
          <div className="grid gap-8">
            <div>
              <InputField
                inputTitle="아이디"
                name="accountId"
                type="text"
                defaultValue={user.accountId}
                icon={UserIcon}
                ref={refAccountId}
                className="w-full bg-transparent py-2.5 pr-3 text-sm text-black outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-dark-500 read-only:text-gray-400"
              />
            </div>

            <div>
              <InputField
                inputTitle="이메일"
                name="email_address" // 💡 스키마와 이름 일치!
                type="email"
                defaultValue={user.email_address}
                ref={refEmail}
                icon={UserIcon} // (적당한 메일 아이콘으로 변경하셔도 됩니다)
              />
            </div>

            <div>
              <InputField
                inputTitle="닉네임"
                name="nickName" // 💡 nickname -> nickName 으로 수정 (Zod 스키마 매칭)
                type="text"
                defaultValue={user.nickName}
                icon={NicknameIcon}
                ref={refNickName}
              />
            </div>

            <div>
              <InputField
                inputTitle="비밀번호"
                name="password"
                type="password"
                placeholder="변경 시에만 입력하세요"
                icon={LockIcon}
                ref={refPassword}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 추가설정 */}
      <div className="grid grid-cols-4 gap-8 py-10 border-t border-gray-200">
        <div className="col-span-1">
          <div className="text-lg font-semibold text-gray-600 mb-3">
            추가설정
          </div>
          <div className="text-gray-400 text-sm">
            회원가입시 입력한 내용 이외의 정보를 기입합니다.
          </div>
        </div>
        <div className="col-span-3">
          <div className="grid gap-8">
            <div>
              <label className="block mb-3 text-sm text-black">
                관리자 설정
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                />
                <span>관리자 권한</span>
              </label>
            </div>

            <div>
              <label className="block mb-3 text-sm text-black">그룹 설정</label>
              <div className="flex flex-wrap gap-4">
                {groupList.map((group) => (
                  <label key={group.id} className="flex gap-2 items-center">
                    <input
                      type="checkbox"
                      checked={selectedGroups.includes(group.id)}
                      onChange={() => handleGroupChange(group.id)}
                    />
                    <span className="text-sm">{group.groupTitle}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block mb-3 text-sm text-black">메모</label>
              <textarea
                name="memo"
                defaultValue={user.memo}
                className="w-full border rounded-md py-2 px-4 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-4 justify-center bg-slate-100/50 pt-5 pb-10 border-t border-slate-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2 text-sm text-white bg-dark-500 rounded-md"
        >
          뒤로가기
        </button>
        <Button
          isLoading={isPending} // 서버 통신 중일 때 스피너 돌고 클릭 방지!
          fullWidth={false}     // 버튼이 화면을 꽉 채우지 않고 내용물 크기만 차지하게 설정
          className="bg-orange-500 hover:bg-cyan-600" // 원래 쓰던 색상으로 덮어쓰기
        >
          저장하기
        </Button>
      </div>
    </form>
  );
};

export default UpdateFormClient;
