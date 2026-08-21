"use client";

import { ExtraFieldConfig } from "@/modules/posts/actions/_type";
import InputField from "@components/form/InputField";

interface Props {
  fields: ExtraFieldConfig[];
  value: any; // 🌟 현재 입력된 값들을 담은 객체
  onChange: (newData: any) => void; // 🌟 값이 바뀔 때 부모에게 알리는 함수
}

export default function ExtraFieldRenderer({ fields, value, onChange }: Props) {
  if (!fields || fields.length === 0) return null;

  // 특정 필드의 값이 바뀔 때 전체 객체를 업데이트하는 핸들러
  const handleFieldChange = (fieldName: string, fieldValue: string) => {
    onChange({
      ...value,
      [fieldName]: fieldValue,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-t border-gray-100 mt-6">
      {fields.map((field) => {
        const currentValue = value?.[field.name] || "";

        return (
          <div key={field.name} className="flex flex-col gap-1">
            {field.type === "select" ? (
              <div className="flex flex-col gap-2">
                <label className="text-sm text-black font-medium">{field.label}</label>
                <select
                  value={currentValue} // 🌟 defaultValue 대신 value 사용
                  onChange={(e) => handleFieldChange(field.name, e.target.value)} // 🌟 onChange 연결
                  required={field.required}
                  className="h-[46px] px-3 rounded-md border border-gray-200 bg-white text-sm outline-none focus:ring-4 focus:ring-gray-100 shadow-md shadow-gray-100"
                >
                  <option value="">선택하세요</option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            ) : (
              <InputField
                inputTitle={field.label}
                type={field.type}
                value={currentValue} // 🌟 defaultValue 대신 value 사용
                onChange={(e) => handleFieldChange(field.name, e.target.value)} // 🌟 onChange 연결
                required={field.required}
                placeholder={`${field.label}을(를) 입력하세요`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}