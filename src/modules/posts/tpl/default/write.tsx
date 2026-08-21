"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";

import type { Attachment as IAttachment } from "@/modules/attachment/actions/_type";

// 그리고 컴포넌트는 원래대로 가져옵니다.
import { Attachment } from "src/modules/attachment";
import { usePostContext } from "./PostProvider";
import PostNotPermission from "@/modules/posts/tpl/default/notPermission";
import ExtraFieldRenderer from "@/modules/posts/tpl/default/ExtraFieldRenderer";
import TiptapEditor from "@components/editor/tiptap/tiptapEditor";
import Button from "@components/button/Button";
import InputField from "@components/form/InputField";
import SelectField from "@components/form/SelectField";

// 1. 프롭 타입 정의 (이게 빠지면 에러 납니다)
interface PostWriteProps {
  savePost: (formData: FormData) => Promise<any>;
  existingPost?: {
    id: number;
    categoryId: number | null;
    title: string | null;
    content: string | null;
    thumbnail?: string | null;
    extraFieldData?: any;
    isSecrets?: boolean | null;
  } | null;
}

const PostWrite: React.FC<PostWriteProps> = ({ savePost, existingPost }) => {
  const { postInfo, permissions } = usePostContext();
  const router = useRouter();
  console.log(postInfo)
  // 2. 필수 상태 및 Ref 선언
  const formRef = useRef<HTMLFormElement | null>(null);
  const editorRef = useRef<any>(null);
  const titleRef = useRef<HTMLInputElement | null>(null);
  const categoryRef = useRef<HTMLSelectElement | null>(null);
  const secretPasswordRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null);
  const [title, setTitle] = useState(existingPost?.title || "");
  const [content, setContent] = useState(existingPost?.content || "");
  const [thumbnail, setThumbnail] = useState(existingPost?.thumbnail || "");
  const [isSecrets, setIsSecrets] = useState(Boolean(existingPost?.isSecrets));
  const [extraData, setExtraData] = useState<any>({
    ...(existingPost?.extraFieldData || {}),
    notificationEnabled: existingPost?.extraFieldData?.notificationEnabled ?? true,
  });

  // 🌟 1. tempId 상태를 추가합니다. (신규 글 작성용)


  // 권한 체크
  if (!permissions.doWrite) return <PostNotPermission />;

  // 3. 저장 함수 (이게 정의되어 있어야 합니다)
  const handleSubmit = async (form: HTMLFormElement | null) => {
    if (!form || loading || !editorRef.current) return;

    setLoading(true);
    setFormMessage(null);
    setFieldErrors(null);
    try {
      const formData = new FormData(form);
      formData.set("isSecrets", isSecrets ? "true" : "false");

      // Tiptap 에디터에서 JSON 추출 (혹은 getHTML())
      const jsonContent = editorRef.current.getJSON();
      formData.append("content", JSON.stringify(jsonContent));
      if (extraData) {
        Object.entries(extraData).forEach(([key, value]) => {
          // 만약 서버가 'extraData__필드명' 형식을 기대한다면 아래처럼 보냅니다.
          formData.append(`extraData__${key}`, String(value));

          // 만약 서버가 그냥 '필드명' 그대로를 기대한다면 아래처럼 보냅니다.
          // formData.append(key, value as string);
        });
      }



      const res = await savePost(formData);

      if (res.success) {
        router.push(`/posts/${postInfo.mid}`);
        router.refresh(); // 목록 갱신
      } else {
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);

          if (res.fieldErrors.title) titleRef.current?.focus();
          else if (res.fieldErrors.categoryId) categoryRef.current?.focus();
          else if (res.fieldErrors.secretPassword || res.fieldErrors.isSecrets) secretPasswordRef.current?.focus();
          else if (res.fieldErrors.content) editorRef.current?.commands?.focus?.();
        } else {
          setFormMessage(res.message || "저장에 실패했습니다.");
        }
      }
    } catch (error) {
      console.error("저장 오류:", error);
      setFormMessage("시스템 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileDelete = (file: IAttachment) => {
    const editor = editorRef.current;
    if (!editor) return;

    // 🌟 Tiptap 에디터에서 해당 경로를 가진 이미지를 찾아 삭제하는 마법의 코드
    editor.commands.command(({ tr, state }) => {
      const { doc } = state;
      let posToDelete: number[] = [];

      // 본문을 훑으며 이미지 노드 중 src가 일치하는 위치(pos)를 모두 찾습니다.
      doc.descendants((node, pos) => {
        if (node.type.name === "image" && node.attrs.src === file.path) {
          posToDelete.push(pos);
        }
      });

      // 찾은 위치를 뒤에서부터 지웁니다 (앞에서 지우면 뒤쪽 인덱스가 밀리기 때문)
      posToDelete.reverse().forEach((pos) => {
        tr.delete(pos, pos + 1);
      });

      return true;
    });

    // 에디터 상태를 강제로 업데이트해서 usedFiles가 다시 계산되게 함
    setContent(editor.getHTML());
    if (thumbnail === file.path) setThumbnail("");
  };

  const IconCategory = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
  );

  return (
    <form ref={formRef} className="space-y-6">
      {/* 4. 수정 모드일 때 ID 전송 */}
      {existingPost && <input type="hidden" name="id" value={existingPost.id} />}
      <input type="hidden" name="thumbnail" value={thumbnail} />

      <div className="text-center text-2xl font-semibold py-8">{postInfo.moduleName}</div>

      {formMessage && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm leading-6 text-red-500">
          {formMessage}
        </div>
      )}

      {postInfo.categories && postInfo.categories.length > 0 && (
        <SelectField
          ref={categoryRef}
          inputTitle="카테고리"
          name="categoryId"
          defaultValue={existingPost?.categoryId ?? ""}
          options={postInfo.categories}
          icon={<IconCategory />} // 필요하다면 아이콘 추가
          error={fieldErrors?.categoryId}
        />
      )}

      <InputField
        ref={titleRef}
        inputTitle="제목"
        type="text"
        name="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목을 입력해주세요."
        className="w-full border-b-2 py-3 text-xl outline-none focus:border-blue-500 font-semibold"
        error={fieldErrors?.title}
        // 혹시 label이 필요한 구조라면 아래 주석을 해제하세요.
        // label="제목"
      />

      {/* 🌟 [추가] 확장 필드 렌더러 */}
      {postInfo.extraFields && postInfo.extraFields.length > 0 && (
        <div className="">
          <ExtraFieldRenderer
            fields={postInfo.extraFields}
            value={extraData}
            onChange={(newData) => setExtraData(newData)}
          />
        </div>
      )}

      {postInfo.config?.secretPost && (
        <div className="rounded-md border border-gray-100 bg-white p-4 dark:border-dark-700 dark:bg-dark-900/80">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={isSecrets}
              onChange={(event) => setIsSecrets(event.target.checked)}
              className="mt-1 h-4 w-4 cursor-pointer rounded border-gray-300 accent-gray-700 dark:border-dark-600 dark:bg-dark-950 dark:accent-dark-300"
            />
            <span>
              <span className="block text-sm font-semibold text-gray-800 dark:text-dark-100">비밀글로 작성</span>
              <span className="mt-1 block text-xs leading-5 text-gray-400 dark:text-dark-400">
                작성자와 관리자, 비밀번호를 입력한 사용자만 본문과 댓글을 볼 수 있습니다.
              </span>
            </span>
          </label>

          {isSecrets && (
            <div className="mt-4">
              <InputField
                ref={secretPasswordRef}
                inputTitle="비밀글 비밀번호"
                type="password"
                name="secretPassword"
                placeholder={existingPost?.isSecrets ? "변경할 때만 새 비밀번호를 입력하세요." : "비밀글 비밀번호를 입력해주세요."}
                error={fieldErrors?.secretPassword || fieldErrors?.isSecrets}
              />
            </div>
          )}
        </div>
      )}

      {/* 에디터 (Tiptap) */}
      <div className="min-h-[400px]">
        <TiptapEditor
          ref={editorRef}
          initialContent={existingPost?.content || ""}
          // 🌟 빈 함수를 추가해서 에러를 해결합니다.
          onChange={(html: string) => {
            setContent(html);
          }}
        />
        {fieldErrors?.content && (
          <div className="mt-1.5 text-xs leading-5 text-red-500">
            {fieldErrors.content}
          </div>
        )}
      </div>

	      <div className="rounded-md border border-gray-100 bg-white p-4 dark:border-dark-700 dark:bg-dark-900/80">
	        <label className="flex cursor-pointer items-start gap-3">
	          <input
	            type="checkbox"
	            checked={extraData.notificationEnabled !== false}
            onChange={(event) => setExtraData((prev: any) => ({
              ...prev,
              notificationEnabled: event.target.checked,
            }))}
	            className="mt-1 h-4 w-4 cursor-pointer rounded border-gray-300 accent-gray-700 dark:border-dark-600 dark:bg-dark-950 dark:accent-dark-300"
	          />
	          <span>
	            <span className="block text-sm font-semibold text-gray-800 dark:text-dark-100">댓글 알림 받기</span>
	            <span className="mt-1 block text-xs leading-5 text-gray-400 dark:text-dark-400">
	              이 글에 새 댓글이 달렸을 때 알림을 받습니다. 알림이 너무 많으면 글마다 끌 수 있습니다.
	            </span>
	          </span>
        </label>
      </div>

      {/* 🌟 [핵심 조립] 첨부파일 엔진 */}
      <div className="">

        <Attachment.Box
          content={content}
          selectedThumbnail={thumbnail}
          onFileClick={(file) => {
            const editor = editorRef.current;
            if (!editor) return;

            if (file.mimeType.startsWith("image/")) {
              if (!thumbnail) setThumbnail(file.path);

              // 🌟 [수정] setImage 대신 insertContent를 사용합니다.
              editor.chain()
                .focus() // 에디터에 다시 집중!
                .insertContent([
                  {
                    type: 'image',
                    attrs: {
                      src: file.path,
                      alt: file.name
                    }
                  },
                  {
                    type: 'paragraph' // 💡 센스 있게 이미지 다음에 빈 줄(문단) 하나 추가!
                  }
                ])
                .run();
            } else {
              // 링크 삽입은 기존과 동일하게 유지해도 됩니다 (이미 insertContent를 쓰고 계셨네요!)
              editor.chain().focus().insertContent(
                `<a href="${file.path}" target="_blank" class="text-blue-600 underline">${file.name}</a> `
              ).run();
            }
          }}
          onFileDelete={handleFileDelete}
          onThumbnailSelect={(file) => setThumbnail(file.path)}
        />
      </div>

      {/* 하단 버튼 바 */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-100 text-gray-600"
        >
          취소
        </Button>
        <Button
          type="button"
          isLoading={loading}
          onClick={() => handleSubmit(formRef.current)}
          className="!bg-blue-100 !text-blue-500 hover:!bg-blue-500 hover:!text-white px-10"
        >
          저장하기
        </Button>
      </div>
    </form>
  );
};

export default PostWrite;
