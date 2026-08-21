import { NextResponse } from "next/server";

const NOTIFICATION_AUTH_ERROR_CODES = new Set(["UNAUTHORIZED", "INVALID_TOKEN"]);

export const isNotificationAuthError = (error: unknown) => {
  return error instanceof Error && NOTIFICATION_AUTH_ERROR_CODES.has(error.message);
};

export const notificationGuestResponse = (data: unknown = { success: false }) => {
  return NextResponse.json(data);
};

export const notificationServerErrorResponse = (message = "알림 처리 중 오류가 발생했습니다.") => {
  return NextResponse.json({ error: message }, { status: 500 });
};
