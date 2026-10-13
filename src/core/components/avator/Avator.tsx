"use client";

import React, { useState, useEffect, useRef } from "react";

interface AvatorProps {
  username?: string | null;
  isLoggedIn?: boolean;
  tokenExpiryTime?: number;
  profileImage?: string | null;
}

const Avator = ({ username, isLoggedIn, tokenExpiryTime, profileImage }: AvatorProps) => {
  const [status, setStatus] = useState("online");
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const displayName = username == null ? "" : String(username);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    const updateStatus = (newStatus) => {
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);

      if (newStatus === "online") {

        statusTimerRef.current = setTimeout(() => {
          setStatus("online");

        }, 1000);
      } else {
        setStatus(newStatus);

      }
    };

    // 🌟 2. 핸들러 함수 하나로 통합 (이벤트 제거를 확실하게 하기 위함)
    const handleStateChange = () => {
      // blur나 visibilityState가 hidden이면 무조건 away
      if (document.visibilityState === "hidden" || !document.hasFocus()) {
        updateStatus("away");
      } else {
        updateStatus("online");
      }
    };

    // 🌟 3. 이벤트 리스너 등록
    window.addEventListener("blur", handleStateChange);
    window.addEventListener("focus", handleStateChange);
    document.addEventListener("visibilitychange", handleStateChange);

    const checkTokenStatus = () => {
      if (!tokenExpiryTime) return;
      if (Date.now() >= tokenExpiryTime) {
        setStatus("expired");

      }
    };
    const interval = setInterval(checkTokenStatus, 10000);

    return () => {
      window.removeEventListener("blur", handleStateChange);
      window.removeEventListener("focus", handleStateChange);
      document.removeEventListener("visibilitychange", handleStateChange);
      clearInterval(interval);
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    };
  }, [isLoggedIn, tokenExpiryTime]);

  const statusColor = {
    online: "bg-green-400",
    away: "bg-amber-400",
    expired: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]",
  };

  return (
    <div className="flex gap-2 items-center">
      <div className="flex items-center">
        <div className="relative flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-gray-400/60 text-[10px] font-semibold text-white transition-colors dark:bg-dark-700 dark:text-dark-100">
          {profileImage ? (
            <img
              src={profileImage}
              alt={displayName || "프로필 이미지"}
              className="h-full w-full object-cover"
            />
          ) : (
            isLoggedIn && (displayName.slice(0, 1).toUpperCase() || "?")
          )}
          {isLoggedIn && (
            <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-dark-900 transition-colors duration-500 ${statusColor[status]}`}></div>
          )}
        </div>
      </div>
      {isLoggedIn && (
        <div className="hidden lg:flex flex-col leading-none">
          <div className="text-left text-[12px] font-bold tracking-tight text-zinc-800 dark:text-dark-100">
            {displayName}
          </div>
          <span className={`hidden text-[9px] font-bold uppercase mt-0.5 transition-colors ${status === 'online' ? 'text-green-500' : 'text-zinc-400'}`}>
            {status === 'online' ? 'Active' : status === 'away' ? 'Away' : 'Expired'}
          </span>
        </div>
      )}
    </div>
  );
};

export default Avator;
