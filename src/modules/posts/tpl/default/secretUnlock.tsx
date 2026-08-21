"use client";

import React, { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";

import Button from "@components/button/Button";
import InputField from "@components/form/InputField";
import { unlockDocumentSecretAction } from "@/modules/document/actions/document.action";

type SecretUnlockProps = {
  slug: string;
  title?: string | null;
};

const SecretUnlock = ({ slug, title }: SecretUnlockProps) => {
  const router = useRouter();
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = () => {
    setFieldError(undefined);
    setMessage(null);

    startTransition(async () => {
      const result = await unlockDocumentSecretAction(slug, password);

      if (!result.success) {
        setFieldError(result.fieldErrors?.password || result.message);
        passwordRef.current?.focus();
        return;
      }

      router.refresh();
    });
  };

  return (
    <div className="mx-auto max-w-screen-md px-3 py-24">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm shadow-gray-100 dark:border-dark-800 dark:bg-dark-900/80 dark:shadow-black/20">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-dark-800 dark:text-dark-200">
            <LockKeyhole size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xl font-bold text-gray-950 dark:text-dark-100">비밀글입니다.</div>
            <div className="mt-2 text-sm leading-6 text-gray-500 dark:text-dark-400">
              {title ? `"${title}" 글을 열람하려면 비밀번호를 입력해주세요.` : "이 글을 열람하려면 비밀번호를 입력해주세요."}
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <InputField
            ref={passwordRef}
            inputTitle="비밀글 비밀번호"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSubmit();
            }}
            placeholder="비밀번호를 입력해주세요."
            error={fieldError}
          />
          {message && <div className="text-xs text-red-500">{message}</div>}
          <div className="flex justify-end">
            <Button type="button" fullWidth={false} isLoading={isPending} onClick={handleSubmit}>
              확인
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecretUnlock;
