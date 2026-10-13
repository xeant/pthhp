import { NextResponse } from "next/server";
import { getWebPushPublicKey } from "@/core/utils/webPush/vapid";
import { getNotificationSettingsRuntimeAction } from "@/modules/admin/actions/settings.action";

export async function GET() {
  const settings = await getNotificationSettingsRuntimeAction();
  if (!settings.webPushEnabled) {
    return NextResponse.json(
      { success: false, message: "Web Push가 비활성화되어 있습니다.", publicKey: "" },
      { status: 403 }
    );
  }

  const publicKey = getWebPushPublicKey();

  if (!publicKey) {
    return NextResponse.json(
      { success: false, message: "WEB_PUSH_VAPID_PUBLIC_KEY가 설정되지 않았습니다.", publicKey: "" },
      { status: 503 }
    );
  }

  return NextResponse.json({ success: true, publicKey });
}
