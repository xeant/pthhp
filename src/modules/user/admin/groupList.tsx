"use client";

import React, { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Edit3, FileText, Hash, Plus, ShieldCheck, Trash2, UsersRound, X } from "lucide-react";

import { GroupInfo } from "@/modules/user/actions/_type";
import { deleteGroup, upsertGroup } from "@/modules/user/actions/group.action";
import Alert from "@components/message/Alert";
import Button from "@components/button/Button";
import InputField from "@components/form/InputField";
import Modal from "@components/modal/Modal";

type Props = {
  initialGroupList: GroupInfo[];
};

const DashboardUserGroupList = ({ initialGroupList }: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [groupUpdate, setGroupUpdate] = useState<GroupInfo | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "warning" | "info";
    message: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null);
  const [showModal, setShowModal] = useState(false);
  const groupTitleRef = useRef<HTMLInputElement>(null);
  const groupNameRef = useRef<HTMLInputElement>(null);
  const groupDescRef = useRef<HTMLInputElement>(null);

  const openCreateModal = () => {
    setMessage(null);
    setFieldErrors(null);
    setGroupUpdate(null);
    setShowModal(true);
  };

  const openUpdateModal = (group: GroupInfo) => {
    setMessage(null);
    setFieldErrors(null);
    setGroupUpdate(group);
    setShowModal(true);
  };

  const handleGroupInfo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setFieldErrors(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const response = await upsertGroup(formData);

        if (response.success || response.type === "success") {
          setShowModal(false);
          setMessage({ type: "success", message: response.message });
          router.refresh();
          return;
        }

        setFieldErrors(response.fieldErrors || { form: response.message });

        if (response.fieldErrors?.groupTitle) groupTitleRef.current?.focus();
        else if (response.fieldErrors?.groupName) groupNameRef.current?.focus();
        else if (response.fieldErrors?.groupDesc) groupDescRef.current?.focus();
      } catch {
        setFieldErrors({ form: "처리 중 오류가 발생했습니다." });
      }
    });
  };

  const handleGroupDelete = async (groupId: number | undefined | null) => {
    if (!groupId) return;
    if (!confirm("정말 삭제하시겠습니까?")) return;

    startTransition(async () => {
      try {
        const response = await deleteGroup(groupId);

        if (response.success || response.type === "success") {
          setMessage({ type: "success", message: response.message });
          router.refresh();
          return;
        }

        setMessage({ type: "error", message: response.message });
      } catch {
        setMessage({ type: "error", message: "삭제 중 오류가 발생했습니다." });
      }
    });
  };

  return (
    <>
      <div>
        {message && (
          <div className="mb-6">
            <Alert message={message.message} type={message.type} />
          </div>
        )}

        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-gray-400">
              <UsersRound size={13} />
              User Control
            </div>
            <div className="mt-2 text-lg font-semibold text-gray-700 dark:text-dark-100">회원 그룹 관리</div>
            <div className="mt-1 text-sm text-gray-400">
              전체 {initialGroupList.length}개의 회원 그룹을 관리합니다.
            </div>
          </div>

          <Button
            type="button"
            onClick={openCreateModal}
            fullWidth={false}
            className="!bg-blue-100 !text-blue-500 hover:!bg-blue-600 hover:!text-white"
            icon={<Plus size={15} />}
          >
            그룹 추가
          </Button>
        </div>

        <div className="overflow-hidden rounded-md border border-gray-100 bg-white shadow-sm shadow-gray-100 dark:border-dark-800 dark:bg-dark-900 dark:shadow-black/20">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80 dark:border-dark-800 dark:bg-dark-950/70">
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">Group</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">ID</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">Description</th>
                  <th className="w-28 px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">Default</th>
                  <th className="w-40 px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {initialGroupList.length > 0 ? (
                  initialGroupList.map((group, index) => (
                    <tr key={group.id || index} className="border-b border-gray-100 transition-colors last:border-b-0 hover:bg-blue-50/40 dark:border-dark-800 dark:hover:bg-white/[0.04]">
                      <td className="px-4 py-4">
                        <div className="text-sm font-semibold text-gray-800 dark:text-dark-100">{group.groupTitle}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="inline-flex rounded-md bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600 dark:bg-dark-800 dark:text-dark-300">
                          {group.groupName}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-dark-300">{group.groupDesc || "-"}</td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-bold ${group.groupDefault ? "bg-cyan-50 text-cyan-600" : "bg-gray-100 text-gray-400"}`}>
                          {group.groupDefault ? "YES" : "NO"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => openUpdateModal(group)}
                            disabled={isPending}
                            className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-md bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-500 transition-colors hover:bg-gray-900 hover:text-white disabled:cursor-not-allowed disabled:text-gray-300 dark:bg-dark-800 dark:text-dark-300 dark:hover:bg-cyan-500 dark:hover:text-dark-950"
                          >
                            <Edit3 size={13} />
                            수정
                          </button>
                          <button
                            type="button"
                            onClick={() => handleGroupDelete(group.id)}
                            disabled={isPending}
                            className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-md bg-red-50 px-3 py-1.5 text-xs font-bold text-red-500 transition-colors hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:text-red-200"
                          >
                            <Trash2 size={13} />
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-sm text-gray-400">
                      등록된 그룹이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal state={showModal} close={setShowModal} size="sm" position="center" escClose overlay overlayClose>
        <div className="max-h-[85vh] overflow-y-auto bg-white dark:bg-dark-900 dark:text-dark-100">
          <div className="flex items-center gap-4 border-b border-gray-100 px-5 py-4 dark:border-dark-800">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-gray-400">
                <ShieldCheck size={13} />
                Group
              </div>
              <div className="mt-1 text-base font-semibold text-gray-800 dark:text-dark-100">
                {groupUpdate ? "그룹 수정" : "그룹 추가"}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-dark-800 dark:hover:text-dark-100"
              aria-label="닫기"
            >
              <X size={17} />
            </button>
          </div>

          <form onSubmit={handleGroupInfo} key={groupUpdate?.id || "new"} className="p-5">
            <input type="hidden" name="groupId" defaultValue={groupUpdate?.id?.toString() || ""} />

            {fieldErrors?.form && (
              <div className="mb-5 rounded-md bg-red-50 px-3 py-2 text-xs leading-5 text-red-500">
                {fieldErrors.form}
              </div>
            )}

            <div className="grid gap-5">
              <div>
                <div className="mb-2 text-sm font-medium text-black dark:text-dark-100">그룹명</div>
                <InputField
                  ref={groupTitleRef}
                  inputTitle="그룹명"
                  name="groupTitle"
                  type="text"
                  defaultValue={groupUpdate?.groupTitle || ""}
                  icon={<UsersRound size={16} />}
                  placeholder="예: 정회원, VVIP 회원"
                  error={fieldErrors?.groupTitle}
                  hideLabel
                />
              </div>

              <div>
                <div className="mb-2 text-sm font-medium text-black dark:text-dark-100">그룹 ID</div>
                <InputField
                  ref={groupNameRef}
                  inputTitle="그룹 ID"
                  name="groupName"
                  type="text"
                  defaultValue={groupUpdate?.groupName || ""}
                  icon={<Hash size={16} />}
                  placeholder="예: vvip_member"
                  readOnly={!!groupUpdate}
                  error={fieldErrors?.groupName}
                  hideLabel
                />
                <div className="mt-2 rounded-md bg-gray-50 px-3 py-2 text-xs leading-5 text-gray-500 dark:bg-dark-950 dark:text-dark-400">
                  영문으로 작성해주세요. 한 번 정한 ID는 변경할 수 없습니다.
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm font-medium text-black dark:text-dark-100">그룹 소개</div>
                <InputField
                  ref={groupDescRef}
                  inputTitle="그룹 소개"
                  name="groupDesc"
                  type="text"
                  defaultValue={groupUpdate?.groupDesc || ""}
                  icon={<FileText size={16} />}
                  placeholder="그룹에 대한 간단한 설명"
                  error={fieldErrors?.groupDesc}
                  hideLabel
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-gray-100 pt-5 dark:border-dark-800">
              <Button type="button" onClick={() => setShowModal(false)} disabled={isPending} fullWidth={false}>
                취소
              </Button>
              <Button
                type="submit"
                isLoading={isPending}
                fullWidth={false}
                className="!bg-cyan-500 !text-white hover:!bg-cyan-600 hover:!text-white"
              >
                저장하기
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default DashboardUserGroupList;
