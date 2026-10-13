import { useQuery, UseQueryOptions } from "@tanstack/react-query";

// 로그인 후 사용자의 정보를 가져오는 함수
const fetchUser = async () => {
  const response = await fetch("/api/auth/me", {
    method: "GET",
    credentials: "include", // 쿠키 포함
  });

  // 로그인 안 된 상태는 401로 내려온다고 가정

  const data = await response.json();

  if (!data.isLoggedIn) return null; // 로그인 안 된 상태는 null 반환

  return data;
};

export const useUser = (options?: Partial<UseQueryOptions<any, Error>>) => {
  const queryOptions: UseQueryOptions<any, Error> = {
    queryKey: ["user"],
    queryFn: fetchUser,
    retry: false, // 로그인 실패 시 재시도 안 함
    staleTime: 15 * 60 * 1000, // 5분 동안 데이터가 신선하다고 간주 (새로고침 시에도 기존 데이터 사용)
    refetchInterval: 45 * 60 * 1000,
    refetchIntervalInBackground: true,
    // cacheTime: 10 * 60 * 1000, // 캐시된 데이터가 10분 동안 유지됨
    refetchOnWindowFocus: true, // 윈도우가 다시 포커스될 때 자동으로 데이터를 새로 고침하지 않도록 설정
    ...options,
  };

  return useQuery(queryOptions); // queryOptions 객체 전달
};
