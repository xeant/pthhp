"use client";

import DefaultNav from "@components/nav/DefaultNav";

export default function UserNavWrapper({ list }: { list: any[] }) {
  return (
    <div className="sticky top-0 z-30 w-full border-b border-gray-200 bg-white/90 backdrop-blur-xl dark:border-dark-800 dark:bg-dark-950/90">
      <div className="mx-auto flex max-w-screen-xl justify-start px-3 md:px-6">
        <DefaultNav list={list} />
      </div>
    </div>
  );
}
