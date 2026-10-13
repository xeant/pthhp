// src/utils/trigger/triggerHandler.ts

import { dispatchNotificationAction } from "@/modules/notification/actions/notification.action";

export const sendNotification = async (data: any, context: any) => {
  // 1. 행위자(Actor): 현재 로그인해서 댓글 쓴 사람 (크롬 유저 1 혹은 사파리 유저 2)
  const actorId = context?.user?.id ?? data?.actorId;

  // 2. 수신자(Target): trigger.json에서 "userId"로 매핑된 값 (게시글 주인)
  const targetId = data?.userId;

  console.log(`[Trigger] Actor(쓴사람): ${actorId}, Target(받을사람): ${targetId}`);

  // 방어 코드
  if (!targetId) {
    console.warn("⚠️ [Trigger Warning]: 매핑된 userId가 없습니다. trigger.json을 확인하세요.");
    return;
  }

  try {
    const notification = await dispatchNotificationAction({ ...data, actorId }, context);
    if (!notification) return;

    console.log(`✅ [Success] ${targetId}님에게 알림 저장 성공! (App: ${data.metadata?.appId})`);
  } catch (error) {
    console.error("❌ 알림 저장 실패:", error);
  }
};
