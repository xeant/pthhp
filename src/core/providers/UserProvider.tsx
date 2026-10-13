"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useUser } from "@/core/hooks/auth/useAuth";

interface UserContextValue {
  user: any | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<any>; // 🌟 토큰 강제 갱신 등이 필요할 때를 위해 refetch도 넘겨줍니다.
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  // 🌟 여기서 useUser 엔진이 돌아갑니다.
  // staleTime, refetchInterval 등을 통해 주기적으로 토큰을 갱신하는 로직이 여기서 실행됩니다.
  const { data: user, isLoading, isError, refetch } = useUser();

  // 성능 최적화를 위해 value를 메모이제이션합니다.
  const value = useMemo(() => ({
    user,
    isLoading,
    isError,
    refetch
  }), [user, isLoading, isError, refetch]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUserContext must be used within a UserProvider");
  return context;
};
