"use client";

import React, { useState } from "react";
import { removeDocumentAction } from "@/modules/document/actions/document.action";
import { useRouter } from "next/navigation";
import Button from "@components/button/Button";

interface DocumentType {
  id: number;
  userId: number | null;
  title?: string | null;
}

interface DocumentDeleteProps {
  document: DocumentType;
  mid: string;
}

const DocumentDelete: React.FC<DocumentDeleteProps> = ({ document, mid }) => {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    setIsPending(true);
    try {
      const result = await removeDocumentAction(document.id, mid);
      if (!result.success) {
        alert(result.message || "삭제 실패");
        return;
      }

      router.push(`/posts/${mid}`);
    } catch (err: any) {
      alert(err.message || "삭제 실패");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className={`max-w-screen-md mx-auto px-3`}>
      <div className={`text-2xl font-semibold mb-2`}>
        {document.title} 글을
      </div>
      <div className={`text-2xl font-semibold mb-4`}>정말 삭제 하시겠습니까?</div>
      <div className={`text-base mb-8 text-rose-400 `}>삭제된 데이터는 영구 삭제되며 복구 할 수 없습니다.</div>
      <div className={`flex gap-4`}>
        <Button
          type="button"
          onClick={() => router.back()}
          disabled={isPending}
        >뒤로가기
        </Button>
        <Button
          type="button"
          onClick={handleDelete}
          isLoading={isPending}
          className="bg-red-100 text-red-600 hover:bg-rose-200 hover:text-red-700 disabled:bg-red-50 disabled:text-red-300 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/60"
        >
          {isPending ? "삭제 중..." : "삭제"}
        </Button>
      </div>
    </div>
  );
};

export default DocumentDelete;
