"use client"; // 1. 클라이언트 컴포넌트 선언

import React, { useEffect, useState } from "react";
import { getMyFiles, deleteAttachment } from "@/modules/attachment/actions/attachment.action";
// 파일 타입 정의 (필요시 수정)
import { Attachment } from "@/modules/attachment/actions/_type";
import PageNavigation from "@components/nav/PageNavigation"; // 혹은 적절한 타입 경로

interface Props {
  onFileSelect?: (file: Attachment) => void; // 부모에게 선택된 파일을 알리기 위한 prop
  imagesOnly?: boolean;
  selectedPath?: string | null;
}

interface PaginationMeta {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export default function MyFiles({ onFileSelect, imagesOnly = false, selectedPath }: Props) {
  // 2. 데이터를 저장할 State
  const [files, setFiles] = useState<any[]>([]); // 타입은 실제 데이터에 맞게 수정
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({
    totalCount: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: 10
  });

  // ✅ 2. 페이지 변경 시 데이터 호출 (useEffect 의존성에 page 추가)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // 페이지 이동 시 로딩 표시
      try {
        const data = await getMyFiles(page); // ✅ 현재 페이지 전달
        console.log("불러온 파일들:", data);

        setFiles(imagesOnly ? data.items.filter((file: any) => file.mimeType?.startsWith("image/")) : data.items);
        setPagination(data.pagination); // ✅ 서버에서 받은 페이지네이션 정보 저장

      } catch (error) {
        console.error("파일 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, imagesOnly]); // ✅ page가 바뀔 때마다 실행

  // ✅ 3. 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // ✅ 2. 삭제 핸들러 추가
  const handleDelete = async (e: React.MouseEvent, fileId: number) => {
    // 🚨 중요: 부모 div의 클릭 이벤트(파일 선택)가 발생하지 않도록 막음
    e.stopPropagation();

    if (!confirm("정말 이 파일을 삭제하시겠습니까?")) return;

    try {
      const result = await deleteAttachment(fileId);

      if (result.success) {
        // UI에서 즉시 제거 (새로고침 없이)
        setFiles((prev) => prev.filter((f) => f.id !== fileId));

        // 혹은 데이터를 다시 불러오고 싶다면:
        // await fetchData();
      } else {
        alert(result.error || "삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("오류가 발생했습니다.");
    }
  };


  if (loading) return <div className="p-4 text-center">로딩 중...</div>;


  return (
    <div className="flex flex-col h-full min-h-[400px]">
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-gray-100 mb-4">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          My Library <span className="text-blue-500">{files.length}</span>
        </div>
        <div className="text-[10px] text-gray-400 italic">Click to Select</div>
      </div>

      {/* 메인 그리드 */}
      <div className="overflow-y-auto max-h-[500px] scrollbar-hide">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {files.map((file) => (
            <div
              key={file.id}
              className="group relative aspect-square bg-gray-50 rounded-lg border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden cursor-pointer"
              onClick={() => onFileSelect?.(file)}
            >
              {/* 이미지/아이콘 영역 */}
              <div className="w-full h-full flex items-center justify-center">
                {file.mimeType?.startsWith("image/") ? (
                  <img
                    src={file.path}
                    alt={file.name || file.originalName}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-300">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                    <span className="text-[8px] font-bold text-gray-400 mt-1 uppercase">
                      {file.mimeType?.split('/')[1] || 'FILE'}
                    </span>
                  </div>
                )}
              </div>

              {/* 하단 다크 그라데이션 오버레이 */}
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2 opacity-100 transition-opacity duration-200 pointer-events-none">
                <span className="text-[12px] text-white font-medium truncate drop-shadow-sm">
                  {file.name || file.originalName}
                </span>
                <span className="text-[8px] text-white/70 font-light">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>

              {/* 삭제 버튼 */}
              <button
                type="button"
                onClick={(e) => handleDelete(e, file.id)}
                className="absolute top-1.5 right-1.5 p-1 bg-black/30 hover:bg-red-500 backdrop-blur-sm rounded-md text-white opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {selectedPath === file.path && (
                <div className="absolute top-1.5 left-1.5 rounded-md bg-blue-500 px-2 py-1 text-[10px] font-semibold text-white">
                  선택됨
                </div>
              )}
            </div>
          ))}
        </div>

        {files.length === 0 && (
          <div className="py-20 text-center text-gray-300 text-xs tracking-widest uppercase">
            No files in library
          </div>
        )}
      </div>

      {/* 하단 페이지네이션 (임시 주석 처리하거나 맞춰서 사용) */}
      <div className="mt-auto p-4 border-t border-gray-50 flex justify-center">
        <PageNavigation page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
      </div>

    </div>
  );
}
