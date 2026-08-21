"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { ExtraFieldConfig } from "@/modules/posts/actions/_type";
import { Plus, Trash2, GripVertical, LayoutGrid } from "lucide-react";
import  Button  from "@components/button/Button";
import InputField from "@components/form/InputField";

interface PostFieldBuilderProps {
  initialFields: ExtraFieldConfig[];
  onSave: (fields: ExtraFieldConfig[]) => Promise<{ success: boolean; error?: string }>;
}

export default function PostFieldBuilder({ initialFields, onSave }: PostFieldBuilderProps) {
  const { register, control, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      extraFields: initialFields || []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "extraFields"
  });

  const onSubmit = async (data: { extraFields: ExtraFieldConfig[] }) => {
    const result = await onSave(data.extraFields);
    if (result.success) {
      alert("게시판 설정이 성공적으로 업데이트되었습니다.");
    }
  };

  return (
    <div className="bg-white dark:bg-dark-950 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm shadow-gray-200/50 dark:shadow-none overflow-hidden">
      {/* 1. Header: gjworks 어드민의 깔끔한 스타일 */}
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 dark:border-gray-800 dark:bg-dark-900/70">
        <div className="flex items-center gap-2">
          <LayoutGrid size={18} className="text-blue-600" />
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">추가 필드 구성 관리</h3>
        </div>

        <Button
          type="button"
          onClick={() => append({ name: "", label: "", type: "text", required: false })}
          className="!flex gap-1 !bg-blue-600 hover:!bg-blue-700 text-white text-xs px-4 h-9 shadow-sm"
        >

          <span className="flex gap-1">
            <Plus size={16} className="mr-1" />
             필드 추가
          </span>
        </Button>
      </div>

      {/* 2. Body: 입력 영역 */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {fields.map((field, index) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex items-end gap-4 p-4 rounded-lg border border-gray-100 bg-white hover:bg-gray-50/30 transition-colors group dark:border-gray-800 dark:bg-dark-900 dark:hover:bg-dark-800"
              >
                {/* 순서 변경 핸들 (장식) */}
                <div className="mb-3 text-gray-300 group-hover:text-gray-400 cursor-grab">
                  <GripVertical size={20} />
                </div>

                {/* DB Key: InputField 필수 Props 적용 */}
                <div className="flex-1">
                  <InputField
                    {...register(`extraFields.${index}.name` as const)}
                    inputTitle="필드 키 (DB Key)"
                    placeholder="예: version_code"
                    required
                  />
                </div>

                {/* Display Label: InputField 필수 Props 적용 */}
                <div className="flex-[1.2]">
                  <InputField
                    {...register(`extraFields.${index}.label` as const)}
                    inputTitle="표시 이름 (Label)"
                    placeholder="예: 소프트웨어 버전"
                    required
                  />
                </div>

                {/* 필드 타입 선택 */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-black font-medium dark:text-gray-100">데이터 타입</label>
                  <select
                    {...register(`extraFields.${index}.type` as const)}
                    className="h-[46px] min-w-[120px] px-3 rounded-md border border-gray-200 bg-white text-sm text-gray-700 outline-none focus:ring-4 focus:ring-gray-100 transition-all shadow-md shadow-gray-100 dark:border-dark-700 dark:bg-dark-900 dark:text-dark-100 dark:shadow-black/20 dark:focus:ring-dark-800"
                  >
                    <option value="text">텍스트</option>
                    <option value="tags">태그(Tags)</option>
                    <option value="number">숫자</option>
                    <option value="date">날짜</option>
                    <option value="select">선택(Select)</option>
                  </select>
                </div>

                {/* 삭제 버튼 */}
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="mb-1 p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-md"
                  title="필드 삭제"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {fields.length === 0 && (
            <div className="py-16 text-center border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/30 dark:border-dark-800 dark:bg-dark-900">
              <p className="text-sm text-gray-400">설정된 추가 필드가 없습니다. 우측 상단의 필드 추가 버튼을 클릭하세요.</p>
            </div>
          )}
        </div>

        {/* 3. Footer: 액션 영역 */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end dark:border-dark-800">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gray-900 hover:bg-black text-white px-8 h-11 font-bold shadow-lg shadow-gray-200 transition-all disabled:bg-gray-300"
          >
            {isSubmitting ? "저장 중..." : "게시판 설정 저장"}
          </Button>
        </div>
      </form>
    </div>
  );
}
