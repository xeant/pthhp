"use client";

import React, { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { KeyRound, RotateCcw, Save, ShieldCheck } from "lucide-react";

import Alert from "@components/message/Alert";
import InputField from "@components/form/InputField";
import Button from "@components/button/Button";

import { changePassword } from "@/modules/user/actions/user.action";

const ChangePassword = ({ close }: { close: (state: boolean) => void }) => {
  const [error, setError] = useState<{ type: string; message: string } | null>(null);

  // 💡 폼 내부의 input 요소들을 찾기 위한 Ref
  const formRef = useRef<HTMLFormElement>(null);

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await changePassword(formData);
    },
    onSuccess: (res) => {
      if (!res.success) {
        // 1. 최상단 Alert용 에러 메시지 세팅
        setError({ type: res.type || "error", message: res.message });

        // 🌟 2. fieldErrors가 넘어왔다면, 첫 번째 에러 인풋을 찾아서 포커스(커서 이동) 시킵니다!
        if (res.fieldErrors) {
          const firstErrorKey = Object.keys(res.fieldErrors)[0]; // ex) "nowPassword"

          // 폼 안에서 name="nowPassword" 인 요소를 찾음
          const errorElement = formRef.current?.elements.namedItem(firstErrorKey) as HTMLInputElement;

          if (errorElement) {
            errorElement.focus(); // 🎯 찌릿! 커서 이동!
          }
        }
        return;
      }

      alert("성공적으로 비밀번호가 변경되었습니다.");
      close(false);
    },
    onError: () => {
      setError({ type: "error", message: "패스워드 변경에 실패했습니다." });
    },
  });

  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    // 💡 HTML의 name 속성들을 카멜케이스로 통일했습니다.
    const nowPassword = form.nowPassword.value;
    const newPassword = form.newPassword.value;
    const renewPassword = form.renewPassword.value;

    if (!nowPassword || !newPassword || !renewPassword) {
      setError({ type: "error", message: "모든 필드를 입력해주세요." });
      return;
    }
    if (newPassword !== renewPassword) {
      setError({ type: "error", message: "신규 비밀번호가 일치하지 않습니다." });
      // 💡 여기서도 신규 비밀번호 확인창으로 포커스 보내기 가능!
      const renewInput = form.elements.namedItem("renewPassword") as HTMLInputElement;
      if (renewInput) renewInput.focus();
      return;
    }

    const formData = new FormData();
    formData.append("nowPassword", nowPassword);
    formData.append("newPassword", newPassword);

    mutation.mutate(formData);
  };

  return (
    <form ref={formRef} onSubmit={submitHandler} className="space-y-5">
      <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm shadow-gray-100 dark:border-dark-800 dark:bg-dark-900 dark:shadow-black/20">
        <div className="mb-5 flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-dark-800 dark:text-dark-300">
            <ShieldCheck size={17} />
          </div>
          <div>
            <div className="text-sm font-black text-gray-950 dark:text-dark-100">비밀번호 변경</div>
            <p className="mt-1 text-xs leading-5 text-gray-400 dark:text-dark-400">
              현재 비밀번호를 확인한 뒤 새 비밀번호로 변경합니다.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4">
            <Alert message={error.message} type={error.type} />
          </div>
        )}

        <div className="space-y-4">
          <InputField
            inputTitle="현재 비밀번호"
            type="password"
            name="nowPassword"
            placeholder="현재 비밀번호를 입력해주세요."
            icon={<KeyRound size={15} />}
          />

          <InputField
            inputTitle="새 비밀번호"
            type="password"
            name="newPassword"
            placeholder="새 비밀번호를 입력해주세요."
            icon={<KeyRound size={15} />}
          />

          <InputField
            inputTitle="새 비밀번호 확인"
            type="password"
            name="renewPassword"
            placeholder="새 비밀번호를 다시 입력해주세요."
            icon={<KeyRound size={15} />}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-1 pt-1">
        <button
          type="button"
          onClick={() => {
            formRef.current?.reset();
            setError(null);
          }}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-transparent bg-transparent px-3 py-2 text-xs font-bold text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-dark-400 dark:hover:bg-dark-800 dark:hover:text-dark-100"
        >
          <RotateCcw size={14} />
          비우기
        </button>

        <Button
          type="submit"
          isLoading={mutation.isPending}
          fullWidth={false}
          className="rounded-full px-4 text-xs font-bold"
        >
          <span className="inline-flex items-center gap-2">
            <Save size={14} />
            변경하기
          </span>
        </Button>
      </div>
    </form>
  );
};

export default ChangePassword;
