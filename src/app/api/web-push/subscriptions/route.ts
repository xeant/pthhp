import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/core/utils/auth/authHelper";
import {
  registerWebPushSubscriptionAction,
  unregisterOtherWebPushSubscriptionsAction,
  unregisterWebPushSubscriptionAction,
  unregisterWebPushSubscriptionByIdAction,
} from "@/modules/notification/actions/web-push.action";
import { countActiveWebPushSubscriptionsQuery, findWebPushSubscriptionsByUserQuery } from "@/modules/notification/actions/web-push.query";

const isAuthError = (error: unknown) => {
  return error instanceof Error && ["UNAUTHORIZED", "INVALID_TOKEN"].includes(error.message);
};

const readSubscriptionBody = async (request: Request) => {
  const body = await request.json().catch(() => ({}));
  const endpoint = body?.endpoint?.toString().trim();
  const id = Number(body?.id || 0);
  const mode = body?.mode?.toString().trim();
  const keys = body?.keys || {};

  return {
    endpoint,
    id: Number.isFinite(id) ? id : 0,
    mode,
    p256dh: keys?.p256dh?.toString().trim() || null,
    auth: keys?.auth?.toString().trim() || null,
  };
};

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    const [activeSubscriptions, subscriptions] = await Promise.all([
      countActiveWebPushSubscriptionsQuery(user.id),
      findWebPushSubscriptionsByUserQuery(user.id),
    ]);

    return NextResponse.json({
      success: true,
      activeSubscriptions,
      subscriptions: subscriptions.map((item) => ({
        id: item.id,
        endpoint: item.endpoint,
        endpointPreview: item.endpoint.replace(/^https?:\/\//, "").slice(0, 42),
        userAgent: item.userAgent || "",
        isActive: Boolean(item.isActive),
        failureCount: Number(item.failureCount || 0),
        lastSeenAt: item.lastSeenAt,
        createdAt: item.createdAt,
      })),
    });
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ success: false, message: "로그인이 필요합니다.", activeSubscriptions: 0 }, { status: 401 });
    }

    console.error("[Web Push API] status failed:", error);
    return NextResponse.json({ success: false, message: "웹 푸시 상태 확인에 실패했습니다." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    const { endpoint, p256dh, auth } = await readSubscriptionBody(request);

    if (!endpoint || endpoint.length < 20) {
      return NextResponse.json({ success: false, message: "유효하지 않은 웹 푸시 구독입니다." }, { status: 400 });
    }

    const result = await registerWebPushSubscriptionAction({
      userId: user.id,
      endpoint,
      p256dh,
      auth,
      userAgent: request.headers.get("user-agent") || null,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ success: false, message: "로그인이 필요합니다." }, { status: 401 });
    }

    console.error("[Web Push API] register failed:", error);
    return NextResponse.json({ success: false, message: "웹 푸시 구독 등록에 실패했습니다." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    const { endpoint, id, mode } = await readSubscriptionBody(request);

    if (mode === "others") {
      if (!endpoint) {
        return NextResponse.json({ success: false, message: "현재 브라우저 endpoint가 없습니다." }, { status: 400 });
      }

      const result = await unregisterOtherWebPushSubscriptionsAction(user.id, endpoint);
      return NextResponse.json(result);
    }

    if (id > 0) {
      const result = await unregisterWebPushSubscriptionByIdAction(user.id, id);
      return NextResponse.json(result);
    }

    if (!endpoint) {
      return NextResponse.json({ success: false, message: "구독 endpoint가 없습니다." }, { status: 400 });
    }

    const result = await unregisterWebPushSubscriptionAction(user.id, endpoint);
    return NextResponse.json(result);
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ success: false, message: "로그인이 필요합니다." }, { status: 401 });
    }

    console.error("[Web Push API] unregister failed:", error);
    return NextResponse.json({ success: false, message: "웹 푸시 구독 해제에 실패했습니다." }, { status: 500 });
  }
}
