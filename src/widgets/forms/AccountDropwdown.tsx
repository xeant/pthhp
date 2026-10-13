"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Dropdown from "@/core/components/dropdown/Dropdown";
import Avator from "@/core/components/avator/Avator";
import DefaultList from "@/core/components/nav/DefaultList";
// 🌟 이제 엔진 대신 '파이프(Context)'를 연결합니다.
import { useUserContext } from "@/core/providers/UserProvider";
import { clearPwaAppBadge } from "@/core/utils/pwa/appBadge";

interface Item {
  title: string;
  name: string;
  route: string;
  condition?: {
    operation: string;
    name: string;
    variable: string | boolean;
  };
}

const AccountDropdown = () => {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  // 🌟 useUser() 대신 컨텍스트 사용
  const { user, isLoading } = useUserContext();

  const closeDropdown = (close: boolean) => setShowDropdown(close);

  const guestNav: Array<Item> = [
    { title: "로그인", name: "Signin", route: "/auth/signin" },
    { title: "회원가입", name: "Register", route: "/auth/register" },
  ];

  const userNav: Array<Item> = [
    { title: "내 정보", name: "user", route: "/user" },
    { title: "개인 설정", name: "preferences", route: "/user/preferences" },
    {
      title: "관리자",
      name: "admin",
      route: "/admin",
      condition: { operation: "equals", name: "isAdmin", variable: true },
    },
    { title: "로그아웃", name: "Signout", route: "/" },
  ];

  // 🌟 [개선] 데이터가 캐시에 있다면 로딩 중이라도 화면을 끊지 않습니다.
  const isActuallyLoading = isLoading && !user;

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    await clearPwaAppBadge();
    window.dispatchEvent(new Event("refresh-unread"));
    // 로그아웃 시엔 컨텍스트가 리셋되도록 페이지 전체를 새로고침하는 게 안전합니다.
    window.location.href = "/";
  };

  const callbackName = (name: string) => {
    if (name === "Signout") handleSignOut();
  };

  return (
    <>
      <div className="relative">
        {isActuallyLoading ? (
          // 🌟 로딩 스켈레톤 (기존 스타일 유지)
          <div className="w-8 h-8 animate-pulse rounded-full bg-gray-200 dark:bg-dark-800" />
        ) : (
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="hover:bg-gray-100/20 py-2 px-3 rounded-md transition-colors cursor-pointer"
          >
            {/* 아바타는 user 데이터 유무에 따라 알아서 동작 */}
            <Avator
              username={user?.nickName}
              isLoggedIn={!!user}
              tokenExpiryTime={user?.expiry || (Date.now() + 3600000)}
              profileImage={user?.profileImage || user?.profile?.profileImage}
            />
          </button>
        )}

        <Dropdown state={showDropdown} close={closeDropdown}>
          {user ? (
            <>
              <div className="w-max min-w-48 max-w-72 overflow-hidden rounded-xl border border-zinc-100 bg-white p-2 shadow-xl shadow-gray-950/5 dark:border-dark-800 dark:bg-dark-900/95 dark:shadow-black/40">
                <div className="border-b border-zinc-100 px-4 py-3 dark:border-dark-800">
                  <p className="text-sm font-bold text-zinc-900 dark:text-dark-100">{user?.nickName}님 환영합니다</p>
                </div>
                <DefaultList list={userNav} loggedInfo={user} callback={callbackName} />
              </div>
            </>
          ) : (
            <>
              <div className="w-max min-w-48 max-w-72 overflow-hidden rounded-xl border border-zinc-100 bg-white p-2 shadow-xl shadow-gray-950/5 dark:border-dark-800 dark:bg-dark-900/95 dark:shadow-black/40">
                <DefaultList list={guestNav} callback={callbackName} />
              </div>
            </>

          )}
        </Dropdown>
      </div>
    </>
  );
};

export default AccountDropdown;
