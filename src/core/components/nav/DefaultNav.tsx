"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Inspage {
  title: string;
  route: string;
}

const DefaultNav = ({ list }) => {
  const pathname = usePathname();
  const [activeTabIndex, setActiveTabIndex] = useState(-1);
  const [tabUnderlineWidth, setTabUnderlineWidth] = useState(0);
  const [tabUnderlineLeft, setTabUnderlineLeft] = useState(0);
  const [prevModule, setPrevModule] = useState<string | null>(null);
  const [nowPathname, setNowPathname] = useState<string | null>(null);

  const tabsRef = useRef<(HTMLAnchorElement | null)[]>([]);

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

  useEffect(() => {
    // Find the index of the tab whose route matches the current pathname
    const index = list.findIndex((item) => item.route === pathname);

    if (index !== -1) {
      setActiveTabIndex(index); // Set activeTabIndex to the found index
    } else {
      setActiveTabIndex(-1);
    }
  }, [list]);

  useEffect(() => {
    setActiveTabIndex(0);
    setNowPathname(pathname);
  }, []);

  useEffect(() => {
    if (!prevModule) {
      const index = list.findIndex((item) => item.route === pathname);
      setActiveTabIndex(index);
    } else {
      setActiveTabIndex(-1);
    }
  }, [prevModule]);

  return (
    <>
      <div className="relative overflow-scroll-hide overflow-hidden overflow-x-auto flex justify-start md:justify-center gap-8 px-3">
        {list &&
          list.map((item, index) => {
            return (
              <Link
                key={index}
                href={item.route}
                // ref={el => (tabsRef.current[index] = el)}
                ref={(el) => {
                  tabsRef.current[index] = el;
                }}
                onClick={() => setActiveTabIndex(index)}
                className={
                  "block whitespace-nowrap py-4 px-1 text-sm hover:text-gray-950 dark:hover:text-dark-300 " +
                  (pathname === item.route
                    ? "text-gray-950 hover:text-gray-400 dark:text-white dark:hover:text-white"
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
    </>
  );
};

export default DefaultNav;
