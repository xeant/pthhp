"use client";

import { JSX } from "react";
import Link from "next/link";

interface Props {
  page: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  basePath?: string;
}

const PageNavigation = ({ page, totalPages, onPageChange, basePath = "" }: Props) => {
  if (!totalPages) return null;

  // 공통 화살표 아이콘
  const PrevIcon = (
    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
    </svg>
  );

  const NextIcon = (
    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
    </svg>
  );

  // 현재 위치가 맨 앞/맨 뒤인지 확인
  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages;

  // 공통 스타일 클래스
  const baseItemClass = "flex items-center justify-center rounded-md text-sm w-[2.25rem] h-[2.25rem] transition-colors ";
  const activeClass = "bg-white dark:bg-dark-900 text-gray-950 dark:text-white border border-gray-300 dark:border-dark-700 hover:border-gray-950";
  const inactiveClass = "text-gray-500 hover:text-black";

  // 이전/다음 버튼 전용 스타일 (활성화 및 비활성화 분리)
  const navBtnClass = baseItemClass + "text-gray-500 hover:text-gray-950 hover:bg-gray-200 dark:hover:text-white dark:hover:bg-dark-900";
  const disabledNavBtnClass = baseItemClass + "text-gray-300 dark:text-gray-700 cursor-not-allowed";

  // 이전/다음 페이지 계산
  const prevPage = Math.max(page - 1, 1);
  const nextPage = Math.min(page + 1, totalPages);

  const pageNavigationList = (): JSX.Element[] => {
    const result: JSX.Element[] = [];

    for (let i = 1; i <= totalPages; i++) {
      const isCurrentPage = page === i;
      const combinedClass = `${baseItemClass} ${isCurrentPage ? activeClass : inactiveClass}`;

      if (onPageChange) {
        result.push(
          <button key={i} onClick={() => onPageChange(i)} className={combinedClass}>
            {i}
          </button>
        );
      } else {
        result.push(
          <Link key={i} href={`${basePath}?page=${i}`} className={combinedClass}>
            {i}
          </Link>
        );
      }
    }
    return result;
  };

  return (
    <div className="flex items-center">
      <nav className="flex gap-1" aria-label="Pagination">
        {/* Previous Button/Link */}
        {isFirstPage ? (
          <button disabled className={disabledNavBtnClass}>
            <span className="sr-only">Previous</span>
            {PrevIcon}
          </button>
        ) : onPageChange ? (
          <button onClick={() => onPageChange(prevPage)} className={navBtnClass}>
            <span className="sr-only">Previous</span>
            {PrevIcon}
          </button>
        ) : (
          <Link href={`${basePath}?page=${prevPage}`} className={navBtnClass}>
            <span className="sr-only">Previous</span>
            {PrevIcon}
          </Link>
        )}

        {/* Page Numbers */}
        {pageNavigationList()}

        {/* Next Button/Link */}
        {isLastPage ? (
          <button disabled className={disabledNavBtnClass}>
            <span className="sr-only">Next</span>
            {NextIcon}
          </button>
        ) : onPageChange ? (
          <button onClick={() => onPageChange(nextPage)} className={navBtnClass}>
            <span className="sr-only">Next</span>
            {NextIcon}
          </button>
        ) : (
          <Link href={`${basePath}?page=${nextPage}`} className={navBtnClass}>
            <span className="sr-only">Next</span>
            {NextIcon}
          </Link>
        )}
      </nav>
    </div>
  );
};

export default PageNavigation;