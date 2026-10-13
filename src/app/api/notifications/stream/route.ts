// src/app/api/notifications/stream/route.ts
import { NextRequest } from "next/server";

import { verify } from "@/core/utils/auth/jwtAuth";
import { notificationEvents } from "@/core/utils/trigger/notificationEvents";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const currentUser = accessToken ? await verify(accessToken) : null;

  if (!currentUser?.id) {
    return new Response(null, { status: 204 });
  }

  const encoder = new TextEncoder();

  // 🌟 핵심 1: 더 이상 컨트롤러를 직접 호출하지 않도록 null로 관리
  let activeController: ReadableStreamDefaultController | null = null;
  let cleanup = () => {};

  const stream = new ReadableStream({
    start(controller) {
      activeController = controller;

      // 1. 초기 연결 메시지
      try {
        activeController.enqueue(encoder.encode(": connected\n\n"));
      } catch (e) {
        activeController = null;
      }

      // 2. 알림 리스너 정의
      const onNotification = (data: any) => {
        if (!activeController) return;

        // 🌟 핵심: 데이터의 수신자(data.userId)와 현재 연결된 유저(currentUserId)가 같을 때만 전송!
        // 숫자인지 문자열인지에 따라 == 또는 String() 처리가 필요할 수 있습니다.
        if (String(data.userId) !== String(currentUser.id)) {
          return; // 내 알림 아니면 무시!
        }

        try {
          const payload = `data: ${JSON.stringify(data)}\n\n`;
          activeController.enqueue(encoder.encode(payload));
        } catch (err) {
          cleanup();
        }
      };

      // 3. 청소 함수
      cleanup = () => {
        if (!activeController) return;
        notificationEvents.off("new-notification", onNotification);
        activeController = null; // 🌟 참조를 끊어서 더 이상 접근 못 하게 함
      };

      // 이벤트 등록
      notificationEvents.on("new-notification", onNotification);
      request.signal.addEventListener("abort", cleanup, { once: true });

      // 4. (중요) 3초마다 보내던 테스트 타이머는 삭제했습니다!
      // 하트비트가 꼭 필요하다면 30초 정도로 아주 길게 설정하세요.
    },
    cancel() {
      cleanup();
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
