"use client";

import React, { useEffect, useState } from "react";
import { Attachment } from "@/modules/attachment/actions/_type";


interface Props {
  attachments: Attachment[]; // 🌟 이제 부모가 필터링해서 줍니다.
  onFileClick?: (file: Attachment) => void;
  onDeleteRequest?: (file: Attachment) => void;
  selectedThumbnail?: string | null;
  onThumbnailSelect?: (file: Attachment) => void;
}

const AttachmentList = ({
  attachments,
  onFileClick,
  onDeleteRequest,
  selectedThumbnail,
  onThumbnailSelect,
}: Props) => {
  if (attachments.length === 0) return null;

  const handleDelete = (file: Attachment) => {
    if (!confirm("해당 이미지를 본문에서 제거 하시겠습니까?")) return;

    // 🌟 부모에게 삭제할 파일을 넘겨줍니다.
    onDeleteRequest?.(file);
  };

  return (
    <div className="mb-8 mt-4">
      <div className="flex items-center justify-between px-1 mb-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-dark-400">
          Attachments <span className="text-gray-500 dark:text-dark-400">{attachments.length}</span>
        </div>
      </div>

      {/* 더 촘촘한 그리드 설정: 기본 3열, 태블릿 4열, 데스크탑 6열 */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {attachments.map((file) => (
          <div
            key={file.id}
            className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-dark-700 dark:bg-dark-900 dark:shadow-black/30"
            onClick={() => onFileClick?.(file)}
          >
            {/* 1. 배경 이미지/아이콘 영역 */}
            <div className="flex h-full w-full items-center justify-center bg-gray-50 dark:bg-dark-800">
              {file.mimeType.startsWith("image/") ? (
                <img
                  src={file.path}
                  alt={file.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-gray-300 dark:text-dark-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                  <span className="mt-1 text-[8px] font-bold uppercase text-gray-400 dark:text-dark-400">{file.mimeType.split('/')[1]}</span>
                </div>
              )}
            </div>

            {/* 2. 이미지 내부 텍스트 오버레이 (하단 그라데이션) */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-2 transition-opacity duration-200">
          <span className="text-[10px] text-white font-medium truncate drop-shadow-sm" title={file.name}>
            {file.name}
          </span>
              <span className="text-[8px] text-white/80 font-light">
            {(file.size / 1024).toFixed(1)} KB
          </span>
            </div>

            {/* 3. 상단 삭제 버튼 (호버 시에만 나타남) */}
            {onThumbnailSelect && file.mimeType.startsWith("image/") && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onThumbnailSelect(file);
                }}
                className={`absolute top-1 left-1 inline-flex cursor-pointer items-center gap-1 px-2 py-1 rounded-md backdrop-blur-sm text-[10px] font-semibold transition-all duration-200 ${
                  selectedThumbnail === file.path
                    ? "bg-sky-500 text-white opacity-100"
                    : "bg-black/20 hover:bg-sky-500 text-white opacity-0 group-hover:opacity-100"
                }`}
              >
                <span
                  className={`flex h-3 w-3 items-center justify-center rounded-[3px] border ${
                    selectedThumbnail === file.path
                      ? "border-white bg-white text-sky-500"
                      : "border-white/80 bg-white/10 text-transparent"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-2.5 w-2.5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.25 7.31a1 1 0 0 1-1.42 0L3.29 9.22a1 1 0 1 1 1.42-1.408l4.04 4.074 6.54-6.59a1 1 0 0 1 1.414-.006Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                썸네일
              </button>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
                handleDelete(file);
              }}
              className="absolute top-1 right-1 p-1 bg-black/20 hover:bg-red-500 backdrop-blur-sm rounded-md text-white opacity-0 group-hover:opacity-100 transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttachmentList;
