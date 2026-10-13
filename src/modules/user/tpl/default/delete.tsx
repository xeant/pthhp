"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CircleAlert, KeyRound, ShieldAlert, Trash2, UserRound } from "lucide-react";

import Alert from "@components/message/Alert";
import InputField from "@components/form/InputField";
import Button from "@components/button/Button";
import HeaderUser from "@/modules/user/tpl/default/header";

// 🌟 비밀번호 확인 액션과, 탈퇴 액션을 모두 불러옵니다.
import { removeMyAccount, verifyMyPassword } from "@/modules/user/actions/user.action";
import { UserInfo } from "@/modules/user/actions/_type";

type Props = {
  initialUser: UserInfo;
};

const UserDelete = ({ initialUser }: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const formRef = useRef<HTMLFormElement>(null);

  const [error, setError] = useState<{ type: string; message: string } | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 💡 핵심: 비밀번호가 서버에서 '인증 완료' 되었는지 추적하는 State
  const [isVerified, setIsVerified] = useState(false);

  // 1️⃣ [돌연변이 1] 비밀번호만 확인하는 기능
  const verifyMutation = useMutation({
    mutationFn: async (password: string) => await verifyMyPassword(password),
    onSuccess: (res) => {
      if (!res.success) {
        setIsVerified(false);
        setSuccessMsg(null);
        setError({ type: res.type || "error", message: res.message });
        const errorElement = formRef.current?.querySelector('input[name="password"]') as HTMLInputElement;
        if (errorElement) errorElement.focus();
        return;
      }

      // ✅ 비밀번호가 맞다면! 에러 끄고, 버튼 상태를 탈퇴 모드로 변신시킴
      setError(null);
      setSuccessMsg(res.message);
      setIsVerified(true);
    }
  });

  // 2️⃣ [돌연변이 2] 실제 계정 삭제 기능
  const deleteMutation = useMutation({
    mutationFn: async (formData: FormData) => await removeMyAccount(formData),
    onSuccess: (res) => {
      if (!res.success) {
        setError({ type: res.type || "error", message: res.message });
        return;
      }
      alert("회원 탈퇴가 완료되었습니다. 그동안 이용해 주셔서 감사합니다.");
      queryClient.clear();
      router.replace("/");
    },
    onError: () => setError({ type: "error", message: "서버 오류가 발생했습니다." })
  });

  // 🎯 폼 전송 핸들러 (버튼 하나로 두 가지 역할을 통제!)
  const handlerUserDeleteSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const formData = new FormData(e.currentTarget);
    const pwd = formData.get("password") as string;

    if (!pwd.trim()) {
      setError({ type: "error", message: "비밀번호를 입력해주세요." });
      // 💡 빈칸일 때도 커서를 찌릿! 하고 이동시킵니다.
      const errorElement = formRef.current?.querySelector('input[name="password"]') as HTMLInputElement;
      if (errorElement) errorElement.focus();
      return;
    }

    if (!isVerified) {
      // 🔒 인증 안 됨 -> 비밀번호 검증 실행!
      verifyMutation.mutate(pwd);
    } else {
      // 🔓 인증 완료됨 -> 진짜 탈퇴 실행!
      if (window.confirm("정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
        deleteMutation.mutate(formData);
      }
    }
  };

  return (
    <>
      <HeaderUser />
      <div className="min-h-screen bg-gray-50 dark:bg-dark-950 dark:text-dark-100">
        <div className="mx-auto max-w-screen-xl px-3 py-6 md:px-6 md:py-8">
          <form ref={formRef} onSubmit={handlerUserDeleteSubmit} className="mx-auto max-w-3xl rounded-md border border-gray-200 bg-white p-5 shadow-sm shadow-gray-100 dark:border-dark-800 dark:bg-dark-900 dark:shadow-black/20">
            <section className="border-b border-gray-200 pb-6 dark:border-dark-800">
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div className="flex items-end gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500 ring-4 ring-white shadow-sm shadow-gray-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-dark-900 dark:shadow-black/30">
                    <ShieldAlert size={32} strokeWidth={1.7} />
                  </div>
                  <div className="pb-1">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-dark-500">
                      <UserRound size={14} />
                      Account Removal
                    </div>
                    <h1 className="mt-2 text-2xl font-black tracking-tight text-gray-950 dark:text-dark-100">회원 탈퇴</h1>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-gray-400 dark:text-dark-400">
                      {initialUser.nickName} 계정을 삭제하기 전에 보존되는 정보와 삭제되는 정보를 확인해주세요.
                    </p>
                  </div>
                </div>
              </div>
            </section>

          {/* 알림 메시지 영역 */}
            {error && <div className="mt-5"><Alert message={error.message} type={error.type} /></div>}
            {successMsg && <div className="mt-5"><Alert message={successMsg} type="success" /></div>}

            <section className="mt-6 space-y-4">
              <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm shadow-gray-100 dark:border-dark-800 dark:bg-dark-900 dark:shadow-black/20">
                <div className="mb-4 flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-300">
                    <Trash2 size={17} />
                  </div>
                  <div>
                    <div className="text-sm font-black text-gray-950 dark:text-dark-100">삭제되는 데이터</div>
                    <p className="mt-1 text-xs leading-5 text-gray-400 dark:text-dark-400">
                      탈퇴 처리와 함께 계정에 직접 연결된 개인 정보가 삭제됩니다.
                    </p>
                  </div>
                </div>
                <ul className="space-y-2 border-l border-gray-200 pl-4 text-sm leading-6 text-gray-600 dark:border-dark-700 dark:text-dark-300">
                  <li>회원 정보, 이메일, 프로필, 비밀번호, 그룹 정보 일체</li>
                  <li>웹사이트 내 개인화 설정과 계정 기준 저장 데이터</li>
                </ul>
              </div>

              <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm shadow-gray-100 dark:border-dark-800 dark:bg-dark-900 dark:shadow-black/20">
                <div className="mb-4 flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-dark-800 dark:text-dark-300">
                    <CircleAlert size={17} />
                  </div>
                  <div>
                    <div className="text-sm font-black text-gray-950 dark:text-dark-100">보존되는 데이터</div>
                    <p className="mt-1 text-xs leading-5 text-gray-400 dark:text-dark-400">
                      서비스 운영과 법적 보관이 필요한 기록은 일정 기간 남을 수 있습니다.
                    </p>
                  </div>
                </div>
                <ul className="space-y-2 border-l border-gray-200 pl-4 text-sm leading-6 text-gray-600 dark:border-dark-700 dark:text-dark-300">
                  <li>서비스 신청 및 결제 내역</li>
                  <li>1:1 문의 내역 및 고객센터 상담 기록</li>
                  <li>작성한 게시글, 댓글 등 공개 콘텐츠</li>
                </ul>
              </div>

              <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm shadow-gray-100 dark:border-dark-800 dark:bg-dark-900 dark:shadow-black/20">
                <div className="mb-4 flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-dark-800 dark:text-dark-300">
                    <KeyRound size={17} />
                  </div>
                  <div>
                    <div className="text-sm font-black text-gray-950 dark:text-dark-100">본인 확인</div>
                    <p className="mt-1 text-xs leading-5 text-gray-400 dark:text-dark-400">
                      현재 비밀번호를 먼저 확인한 뒤 탈퇴를 진행할 수 있습니다.
                    </p>
                  </div>
                </div>
                <InputField
                  inputTitle="현재 비밀번호"
                  type="password"
                  name="password"
                  placeholder="비밀번호를 입력해주세요."
                  onChange={() => {
                    if (isVerified) {
                      setIsVerified(false);
                      setSuccessMsg(null);
                    }
                  }}
                />
              </div>
            </section>

            <div className="sticky bottom-0 mt-6 flex items-center justify-between gap-3 border-t border-gray-200 bg-white/90 py-4 backdrop-blur-xl dark:border-dark-800 dark:bg-dark-900/90">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-500 shadow-sm shadow-gray-100 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-950 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-400 dark:shadow-black/20 dark:hover:border-dark-700 dark:hover:bg-dark-800 dark:hover:text-dark-100"
              >
                <ArrowLeft size={14} />
                취소
              </button>

            {/* 🌟 마법의 버튼! 인증 여부에 따라 디자인과 텍스트가 확 바뀝니다! */}
              <Button
                type="submit"
                isLoading={verifyMutation.isPending || deleteMutation.isPending}
                fullWidth={false}
                className={`rounded-full px-5 text-xs font-bold transition ${
                  !isVerified
                    ? "bg-gray-100 !text-gray-600 hover:bg-gray-900 hover:!text-white dark:bg-dark-900 dark:!text-dark-200 dark:hover:bg-dark-100 dark:hover:!text-dark-950"
                    : "bg-red-500 !text-white shadow-md shadow-red-500/20 hover:bg-red-600"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  {!isVerified ? <KeyRound size={14} /> : <Trash2 size={14} />}
                  {!isVerified ? "비밀번호 확인" : "진짜 탈퇴하기"}
                </span>
              </Button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
};

export default UserDelete;
