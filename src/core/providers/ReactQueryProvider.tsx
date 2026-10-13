"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function ReactQueryProvider({ children }) {
  // 🌟 중요: useState를 사용해야 브라우저 세션 동안 딱 한 번만 QueryClient가 생성됩니다.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            refetchOnMount: false, // 뒤로가기 시 불필요한 재요청 방지
            refetchOnWindowFocus: true,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}