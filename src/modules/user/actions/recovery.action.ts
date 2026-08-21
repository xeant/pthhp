"use server";

import crypto from "node:crypto";
import { z } from "zod";
import { hashedPassword } from "@utils/auth/password";
import { ActionResponse } from "@/core/types/actions";
import { sendMail } from "@/core/utils/mail/smtp";
import { getAuthSettingsRuntimeAction, validatePasswordByAuthSettings } from "@/modules/admin/actions/auth-settings";
import * as query from "./recovery.query";

const requestAccountIdSchema = z.object({
  email: z.string().trim().email("올바른 이메일을 입력해주세요."),
});

const requestPasswordResetSchema = z.object({
  account: z.string().trim().min(1, "아이디 또는 이메일을 입력해주세요.").max(120, "입력값이 너무 깁니다."),
});

const resetPasswordSchema = z.object({
  token: z.string().trim().min(32, "재설정 토큰이 올바르지 않습니다."),
  password: z.string().trim().min(1, "새 비밀번호를 입력해주세요."),
  passwordConfirm: z.string().trim().min(1, "새 비밀번호 확인을 입력해주세요."),
});

const tokenHash = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

const normalizeBaseUrl = (url: string) => url.endsWith("/") ? url.slice(0, -1) : url;

const isActiveUser = (status?: string | null) => !status || status === "active";

const genericAccountIdMessage = "입력한 이메일과 일치하는 계정이 있으면 계정 ID 안내 메일을 발송했습니다.";
const genericPasswordMessage = "입력한 정보와 일치하는 계정이 있으면 비밀번호 재설정 메일을 발송했습니다.";

export const requestAccountIdRecoveryAction = async (formData: FormData): Promise<ActionResponse<null>> => {
  const validation = requestAccountIdSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validation.success) {
    return {
      success: false,
      type: "error",
      message: "입력값을 확인해주세요.",
      fieldErrors: { email: validation.error.issues[0]?.message || "올바른 이메일을 입력해주세요." },
    };
  }

  try {
    const user = await query.findRecoveryUserByEmail(validation.data.email);

    if (user && isActiveUser(user.status)) {
      await sendMail({
        to: user.email_address,
        subject: "[Plextype] 계정 ID 안내",
        text: [
          `${user.nickName}님, 요청하신 계정 ID 안내입니다.`,
          "",
          `계정 ID: ${user.accountId}`,
          "",
          "본인이 요청하지 않았다면 이 메일을 무시해주세요.",
        ].join("\n"),
      });
    }

    return { success: true, type: "success", message: genericAccountIdMessage, data: null };
  } catch (error) {
    console.error("requestAccountIdRecoveryAction Error:", error);
    return { success: false, type: "error", message: "계정 ID 안내 요청 처리 중 오류가 발생했습니다." };
  }
};

export const requestPasswordResetAction = async (formData: FormData): Promise<ActionResponse<null>> => {
  const validation = requestPasswordResetSchema.safeParse({
    account: formData.get("account"),
  });

  if (!validation.success) {
    return {
      success: false,
      type: "error",
      message: "입력값을 확인해주세요.",
      fieldErrors: { account: validation.error.issues[0]?.message || "아이디 또는 이메일을 입력해주세요." },
    };
  }

  try {
    await query.deleteExpiredPasswordResetTokens();

    const user = await query.findRecoveryUserByAccountOrEmail(validation.data.account);

    if (user && isActiveUser(user.status)) {
      const rawToken = crypto.randomBytes(32).toString("base64url");
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
      const baseUrl = normalizeBaseUrl(await query.findPublicSiteUrl());
      const resetUrl = `${baseUrl}/auth/reset-password?token=${encodeURIComponent(rawToken)}`;

      await query.createPasswordResetToken(user.id, tokenHash(rawToken), expiresAt);
      await sendMail({
        to: user.email_address,
        subject: "[Plextype] 비밀번호 재설정 안내",
        text: [
          `${user.nickName}님, 비밀번호 재설정 요청을 받았습니다.`,
          "",
          "아래 링크에서 30분 안에 새 비밀번호를 설정해주세요.",
          resetUrl,
          "",
          "본인이 요청하지 않았다면 이 메일을 무시해주세요.",
        ].join("\n"),
        html: [
          `<p>${user.nickName}님, 비밀번호 재설정 요청을 받았습니다.</p>`,
          `<p>아래 링크에서 30분 안에 새 비밀번호를 설정해주세요.</p>`,
          `<p><a href="${resetUrl}">${resetUrl}</a></p>`,
          `<p>본인이 요청하지 않았다면 이 메일을 무시해주세요.</p>`,
        ].join(""),
      });
    }

    return { success: true, type: "success", message: genericPasswordMessage, data: null };
  } catch (error) {
    console.error("requestPasswordResetAction Error:", error);
    return { success: false, type: "error", message: "비밀번호 재설정 요청 처리 중 오류가 발생했습니다." };
  }
};

export const resetPasswordAction = async (formData: FormData): Promise<ActionResponse<null>> => {
  const validation = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
  });

  if (!validation.success) {
    const issue = validation.error.issues[0];
    return {
      success: false,
      type: "error",
      message: issue?.message || "입력값을 확인해주세요.",
      fieldErrors: issue?.path?.[0] ? { [String(issue.path[0])]: issue.message } : undefined,
    };
  }

  if (validation.data.password !== validation.data.passwordConfirm) {
    return {
      success: false,
      type: "error",
      message: "새 비밀번호가 서로 일치하지 않습니다.",
      fieldErrors: { passwordConfirm: "새 비밀번호가 서로 일치하지 않습니다." },
    };
  }

  try {
    const settings = await getAuthSettingsRuntimeAction();
    const passwordError = validatePasswordByAuthSettings(validation.data.password, settings);

    if (passwordError) {
      return {
        success: false,
        type: "error",
        message: passwordError,
        fieldErrors: { password: passwordError },
      };
    }

    const tokenRecord = await query.findValidPasswordResetToken(tokenHash(validation.data.token));
    if (!tokenRecord) {
      return {
        success: false,
        type: "error",
        message: "재설정 링크가 만료되었거나 이미 사용되었습니다.",
      };
    }

    const passwordHash = await hashedPassword(validation.data.password);
    await query.updateUserPasswordAndClearSession(tokenRecord.userId, passwordHash);
    await query.markPasswordResetTokenUsed(tokenRecord.id);

    return {
      success: true,
      type: "success",
      message: "비밀번호가 변경되었습니다. 새 비밀번호로 로그인해주세요.",
      data: null,
    };
  } catch (error) {
    console.error("resetPasswordAction Error:", error);
    return { success: false, type: "error", message: "비밀번호 변경 중 오류가 발생했습니다." };
  }
};
