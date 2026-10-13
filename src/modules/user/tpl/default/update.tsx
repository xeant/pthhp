"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { ArrowLeft, AtSign, Camera, KeyRound, Mail, Save, UserRound, X } from "lucide-react";

import Popup from "@components/modal/Popup";
import Alert from "@components/message/Alert";
import ChangePassword from "./changePassword";
import HeaderUser from "@/modules/user/tpl/default/header";

import Button from "@components/button/Button"; // 💡 공용 버튼
// 💡 1. InputField 임포트 추가! (경로가 다르면 수정해주세요)
import InputField from "@components/form/InputField";
import UploadFileManager from "@components/editor/UploadFileManager";
import MyFiles from "@/modules/attachment/tpl/default/myFiles";

import { saveUserAction, updateProfileImageAction } from "@/modules/user/actions/user.action";
import { UserInfo } from "@/modules/user/actions/_type";
import type { Attachment } from "@/modules/attachment/actions/_type";

type Props = {
  initialUser: UserInfo; // 💡 page.tsx에서 받은 데이터
};

const UpdateUser = ({ initialUser }: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showPopup, setShowPopup] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [profileImage, setProfileImage] = useState(initialUser.profile?.profileImage || "");
  const [error, setError] = useState<{ type: string; message: string } | null>(null);

  const closePopup = (close: boolean) => {
    setShowPopup(close);
  };

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      // 💡 1. 기존에 넣었던 필수 정보들
      formData.append("id", initialUser.id.toString());
      formData.append("accountId", initialUser.accountId);
      formData.append("email_address", initialUser.email_address);
      formData.append("isAdmin", initialUser.isAdmin?.toString() || "false");

      formData.append("isProfileUpdate", "true");

      // 🌟 2. Zod 통과를 위한 "빈 서류" 끼워넣기!
      // (마이페이지에서는 비밀번호를 따로 변경하므로 빈 문자열로 넘겨줍니다)
      if (!formData.has("password")) {
        formData.append("password", "");
      }

      return await saveUserAction(formData);
    },
    onSuccess: async (res) => {
      if (!res.success) {
        // 🌟 3. 혹시 또 에러가 나면, Zod가 정확히 '어떤 필드' 때문에 화났는지 콘솔에 찍어봅니다!
        console.log("🚨 Zod 검증 실패 원인:", res.fieldErrors);
        setError({ type: res.type || "error", message: res.message });
        return;
      }

      alert("성공적으로 수정되었습니다.");
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      router.refresh();
    },
    onError: () => {
      setError({ type: "error", message: "회원 정보 수정 중 오류가 발생했습니다." });
    },
  });

  const profileMutation = useMutation({
    mutationFn: async (nextProfileImage: string | null) => {
      return await updateProfileImageAction(nextProfileImage);
    },
    onSuccess: async (res) => {
      if (!res.success) {
        setError({ type: res.type || "error", message: res.message });
        return;
      }

      setProfileImage(res.data?.profileImage || "");
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      router.refresh();
      setShowProfilePopup(false);
    },
    onError: () => {
      setError({ type: "error", message: "프로필 이미지 변경 중 오류가 발생했습니다." });
    },
  });

  const handleUserInfoSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    mutation.mutate(formData);
  };

  const handleProfileImageSelect = (file: Attachment) => {
    if (!file.mimeType?.startsWith("image/")) {
      alert("이미지 파일만 프로필 이미지로 사용할 수 있습니다.");
      return;
    }

    profileMutation.mutate(file.path);
  };

  const handleProfileImageDelete = () => {
    if (!profileImage) return;
    if (!confirm("프로필 이미지를 삭제하시겠습니까?")) return;
    profileMutation.mutate(null);
  };

  return (
    <>
      <HeaderUser />
      <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
        <div className="mx-auto max-w-screen-xl px-3 py-6 md:px-6 md:py-8">
          <form onSubmit={handleUserInfoSubmit} className="mx-auto max-w-3xl rounded-md border border-gray-200 bg-white p-5 shadow-sm shadow-gray-100 dark:border-dark-800 dark:bg-dark-900 dark:shadow-black/20">
            {error && (
              <div className="mb-5">
                <Alert message={error.message} type={error.type} />
              </div>
            )}

            <section className="border-b border-gray-200 pb-6 dark:border-dark-800">
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div className="flex items-end gap-4">
                  <div className="relative h-20 w-20 overflow-hidden rounded-full bg-gray-200 ring-4 ring-white shadow-sm shadow-gray-200 dark:bg-dark-800 dark:ring-dark-900 dark:shadow-black/30">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="프로필 이미지"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-gray-500 dark:text-dark-300">
                        {initialUser.nickName?.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="pb-1">
                    <div className="text-2xl font-black tracking-tight text-gray-950 dark:text-dark-100">
                      {initialUser.nickName}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm font-semibold text-gray-400">
                      <span>@{initialUser.accountId}</span>
                      <span className="text-gray-300 dark:text-dark-600">·</span>
                      <span>{initialUser.email_address}</span>
                    </div>
                  </div>
                </div>

                <div className="flex w-full gap-2 md:w-auto">
                  <button
                    type="button"
                    onClick={() => setShowProfilePopup(true)}
                    className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 shadow-sm shadow-gray-100 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-950 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-300 dark:shadow-black/20 dark:hover:border-dark-700 dark:hover:bg-dark-800 dark:hover:text-dark-100 md:flex-none"
                  >
                    <Camera size={14} />
                    이미지 변경
                  </button>
                  <button
                    type="button"
                    onClick={handleProfileImageDelete}
                    disabled={!profileImage || profileMutation.isPending}
                    className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-400 shadow-sm shadow-gray-100 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-500 dark:shadow-black/20 dark:hover:border-red-900/60 dark:hover:bg-red-950/20 dark:hover:text-red-400 md:flex-none"
                  >
                    <X size={14} />
                    삭제
                  </button>
                </div>
              </div>
            </section>

            <section className="mt-6 space-y-4">
              <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm shadow-gray-100 dark:border-dark-800 dark:bg-dark-900 dark:shadow-black/20">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-dark-800 dark:text-dark-300">
                    <AtSign size={17} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-dark-500">Account ID</div>
                    <div className="mt-1 truncate text-sm font-bold text-gray-900 dark:text-dark-100">{initialUser.accountId}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm shadow-gray-100 dark:border-dark-800 dark:bg-dark-900 dark:shadow-black/20">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-dark-800 dark:text-dark-300">
                    <Mail size={17} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-dark-500">Email</div>
                    <div className="mt-1 truncate text-sm font-bold text-gray-900 dark:text-dark-100">{initialUser.email_address}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm shadow-gray-100 dark:border-dark-800 dark:bg-dark-900 dark:shadow-black/20">
                <div className="mb-4 flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-dark-800 dark:text-dark-300">
                    <UserRound size={17} />
                  </div>
                  <div>
                    <div className="text-sm font-black text-gray-950 dark:text-dark-100">닉네임</div>
                    <p className="mt-1 text-xs leading-5 text-gray-400 dark:text-dark-400">
                      게시글과 댓글에 표시되는 이름입니다.
                    </p>
                  </div>
                </div>
                <InputField
                  inputTitle="닉네임"
                  type="text"
                  name="nickName"
                  placeholder="변경할 닉네임을 입력해주세요."
                  defaultValue={initialUser.nickName}
                />
              </div>

              <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm shadow-gray-100 dark:border-dark-800 dark:bg-dark-900 dark:shadow-black/20">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-dark-800 dark:text-dark-300">
                      <KeyRound size={17} />
                    </div>
                    <div>
                      <div className="text-sm font-black text-gray-950 dark:text-dark-100">비밀번호</div>
                      <p className="mt-1 text-xs leading-5 text-gray-400 dark:text-dark-400">
                        계정 보호를 위해 주기적으로 비밀번호를 변경할 수 있습니다.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="inline-flex cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-950 dark:border-dark-700 dark:bg-dark-800 dark:text-dark-200 dark:hover:border-dark-600 dark:hover:bg-dark-700 dark:hover:text-white"
                    onClick={() => setShowPopup(true)}
                  >
                    비밀번호 변경
                  </button>
                </div>
              </div>
            </section>

            <div className="sticky bottom-0 mt-6 flex items-center justify-between gap-3 border-t border-gray-200 bg-white/90 py-4 backdrop-blur-xl dark:border-dark-800 dark:bg-dark-900/90">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-500 shadow-sm shadow-gray-100 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-950 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-400 dark:shadow-black/20 dark:hover:border-dark-700 dark:hover:bg-dark-800 dark:hover:text-dark-100"
              >
                <ArrowLeft size={14} />
                돌아가기
              </button>

              <Button
                type="submit"
                isLoading={mutation.isPending}
                fullWidth={false}
              >
                <span className="inline-flex items-center gap-2">
                  <Save size={14} />
                  저장하기
                </span>
              </Button>
            </div>
          </form>
        </div>
      </div>

      <Popup id="change-password-popup" state={showPopup} title="비밀번호 변경" close={closePopup} showFooter={false}>
        <ChangePassword close={closePopup} />
      </Popup>

      <Popup
        id="profile-image-popup"
        state={showProfilePopup}
        title="프로필 이미지 변경"
        close={setShowProfilePopup}
        showFooter={false}
      >
        <div className="space-y-6">
          {profileMutation.isPending && (
            <div className="rounded-md bg-blue-50 px-3 py-2 text-xs text-blue-500">
              프로필 이미지를 저장하고 있습니다.
            </div>
          )}

          <UploadFileManager
            onUploadSuccess={() => {}}
            onFileClick={handleProfileImageSelect}
          />

          <MyFiles
            imagesOnly
            selectedPath={profileImage}
            onFileSelect={handleProfileImageSelect}
          />
        </div>
      </Popup>
    </>
  );
};

export default UpdateUser;
