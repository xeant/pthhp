"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation"; // useSearchParams 추가
import { usePostContext } from "@/modules/posts/tpl/default/PostProvider";

const PostsCategories = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams(); // URL 쿼리 파라미터 읽기

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [tabUnderlineWidth, setTabUnderlineWidth] = useState(0);
  const [tabUnderlineLeft, setTabUnderlineLeft] = useState(0);

  const tabsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const { postInfo } = usePostContext();
  const Category = postInfo.categories;
  console.log(Category)

  // URL의 category 파라미터 값 가져오기
  const currentCategory = searchParams?.get("category");

  // 1. URL이 변경되면(카테고리 클릭 시) activeTabIndex를 업데이트
  useEffect(() => {
    if (!currentCategory) {
      // 카테고리 파라미터가 없으면 '전체'(0번 인덱스)
      setActiveTabIndex(0);
    } else {
      // 카테고리 파라미터가 있으면 해당 ID를 가진 인덱스를 찾음
      const targetIndex = Category.findIndex(
        (item) => String(item.id) === currentCategory
      );
      // 찾았으면 +1 (0번은 '전체'니까), 못 찾았으면 0
      setActiveTabIndex(targetIndex !== -1 ? targetIndex + 1 : 0);
    }
  }, [currentCategory, Category]);

  // 2. activeTabIndex가 변경될 때마다 밑줄 위치(애니메이션) 업데이트
  useEffect(() => {
    function setTabPosition() {
      const currentTab = tabsRef.current[activeTabIndex];
      if (currentTab) {
        setTabUnderlineLeft(currentTab.offsetLeft);
        setTabUnderlineWidth(currentTab.clientWidth);
      }
    }

    setTabPosition();
    window.addEventListener("resize", setTabPosition);

    return () => window.removeEventListener("resize", setTabPosition);
  }, [activeTabIndex]);

  return (
    <div className="flex top-0 lg:top-0 w-full bg-white/90 dark:bg-dark-950/40 backdrop-blur-lg z-90 border-b border-gray-100 dark:border-dark-700">
      <div className="relative overflow-scroll-hide overflow-hidden overflow-x-auto flex justify-start md:justify-center gap-8 px-3">

        {/* '전체' 링크: 카테고리 쿼리를 제거하여 원래 경로로 이동 */}
        <Link
          key={0}
          href={pathname || "/"}
          ref={(el) => {
            tabsRef.current[0] = el;
          }}
          className={
            "block whitespace-nowrap py-4 px-1 text-sm hover:text-gray-950 dark:hover:text-dark-300 " +
            (activeTabIndex === 0
              ? "text-gray-950 hover:text-gray-400 dark:text-white dark:hover:text-white font-bold"
              : "text-gray-600 dark:text-dark-300 dark:hover:text-white")
          }
        >
          전체
        </Link>

        {Category &&
          Category.map((item, index) => {
            const tabIndex = index + 1;

            // 현재 탭이 활성화 상태인지 확인
            const isActive = activeTabIndex === tabIndex;

            return (
              <Link
                key={tabIndex}
                // href 설정: 현재 경로 + ?category=아이디
                href={{
                  pathname: pathname,
                  query: { category: item.id }
                }}
                ref={(el) => {
                  tabsRef.current[tabIndex] = el;
                }}
                className={
                  "block whitespace-nowrap py-4 px-1 text-sm hover:text-gray-950 dark:hover:text-dark-300 " +
                  (isActive
                    ? "text-gray-950 hover:text-gray-400 dark:text-white dark:hover:text-white font-bold"
                    : "text-gray-600 dark:text-dark-300 dark:hover:text-white")
                }
              >
                {item.title}
              </Link>
            );
          })}

        <div
          className="absolute bottom-0 block h-1 bg-gray-950 dark:bg-white transition-all duration-300"
          style={{ left: tabUnderlineLeft, width: tabUnderlineWidth }}
        ></div>
      </div>
    </div>
  );
};

export default PostsCategories;
