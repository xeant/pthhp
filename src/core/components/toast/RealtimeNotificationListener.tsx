"use client";

import { useRealtimeNotification } from "@hooks/notification/useRealtimeNotification";
import { useUserContext } from "@/core/providers/UserProvider";

export default function RealtimeNotificationListener() {
  const { user, isLoading } = useUserContext();

  // 유저 정보가 있고, 로딩이 끝났을 때만 아이디를 넘겨줍니다.
  // user 객체 안에 id가 어떻게 들어있는지(user.id 또는 user.userId 등) 확인해보세요!
  useRealtimeNotification(user?.id);

  return null;
}