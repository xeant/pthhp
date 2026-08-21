"use server";

import { revalidatePath } from "next/cache";

import { ActionState } from "./_type";
import { getLoggedUserAction } from "./user.action";
import {
  DEFAULT_USER_PREFERENCE,
  UserFontScalePreference,
  UserPreferenceData,
  UserThemePreference,
  findUserPreferenceByUserId,
  upsertUserPreference,
} from "./preference.query";

const themeOptions: UserThemePreference[] = ["system", "light", "dark"];
const fontScaleOptions: UserFontScalePreference[] = ["small", "normal", "large"];

const readBoolean = (formData: FormData, key: keyof UserPreferenceData) => {
  return formData.get(key) === "true";
};

export async function getMyPreferenceAction(): Promise<ActionState<UserPreferenceData>> {
  const loggedInfo = await getLoggedUserAction();

  if (!loggedInfo?.id) {
    return {
      success: false,
      type: "error",
      message: "로그인이 필요합니다.",
      data: DEFAULT_USER_PREFERENCE,
    };
  }

  const preference = await findUserPreferenceByUserId(loggedInfo.id);

  return {
    success: true,
    type: "success",
    message: "개인 설정을 불러왔습니다.",
    data: preference,
  };
}

export async function saveMyPreferenceAction(formData: FormData): Promise<ActionState<UserPreferenceData>> {
  const loggedInfo = await getLoggedUserAction();

  if (!loggedInfo?.id) {
    return { success: false, type: "error", message: "로그인이 필요합니다." };
  }

  const theme = formData.get("theme")?.toString() as UserThemePreference;
  const fontScale = formData.get("fontScale")?.toString() as UserFontScalePreference;

  const preference: UserPreferenceData = {
    theme: themeOptions.includes(theme) ? theme : DEFAULT_USER_PREFERENCE.theme,
    notifyComments: readBoolean(formData, "notifyComments"),
    notifyReplies: readBoolean(formData, "notifyReplies"),
    notifyAdmin: readBoolean(formData, "notifyAdmin"),
    reduceMotion: readBoolean(formData, "reduceMotion"),
    fontScale: fontScaleOptions.includes(fontScale) ? fontScale : DEFAULT_USER_PREFERENCE.fontScale,
  };

  try {
    const savedPreference = await upsertUserPreference(loggedInfo.id, preference);
    revalidatePath("/user/preferences");

    return {
      success: true,
      type: "success",
      message: "개인 설정이 저장되었습니다.",
      data: savedPreference,
    };
  } catch (error) {
    console.error("saveMyPreferenceAction 에러:", error);
    return { success: false, type: "error", message: "개인 설정 저장에 실패했습니다." };
  }
}
