import redisClient from "@utils/redis/redis";
import { timeToSeconds } from "@/core/utils/date/timeToSeconds";
import { AuthSettingsData, AuthSettingsSchema } from "./_type";
import { getSettingsByKeysQuery, SettingSeed } from "./settings.query";

export const AUTH_SETTINGS_CACHE_KEY = "app:settings:auth";
export const SETTINGS_CACHE_TTL = 60 * 60 * 24;

export const AUTH_SETTING_META = {
  registrationEnabled: {
    key: "auth.registrationEnabled",
    label: "회원가입 허용",
    fallback: "true",
    isPublic: false,
  },
  accountDeletionEnabled: {
    key: "auth.accountDeletionEnabled",
    label: "탈퇴 허용",
    fallback: "true",
    isPublic: false,
  },
  defaultUserStatus: {
    key: "auth.defaultUserStatus",
    label: "가입 후 상태",
    fallback: "active",
    isPublic: false,
  },
  minPasswordLength: {
    key: "auth.minPasswordLength",
    label: "비밀번호 최소 길이",
    fallback: "8",
    isPublic: false,
  },
  requirePasswordNumber: {
    key: "auth.requirePasswordNumber",
    label: "숫자 포함",
    fallback: "false",
    isPublic: false,
  },
  requirePasswordLetter: {
    key: "auth.requirePasswordLetter",
    label: "영문 포함",
    fallback: "false",
    isPublic: false,
  },
  requirePasswordSpecial: {
    key: "auth.requirePasswordSpecial",
    label: "특수문자 포함",
    fallback: "false",
    isPublic: false,
  },
  loginFailLimit: {
    key: "auth.loginFailLimit",
    label: "실패 허용 횟수",
    fallback: "5",
    isPublic: false,
  },
  loginFailWindowMinutes: {
    key: "auth.loginFailWindowMinutes",
    label: "실패 카운트 유지",
    fallback: "15",
    isPublic: false,
  },
  loginLockMinutes: {
    key: "auth.loginLockMinutes",
    label: "로그인 잠금 시간",
    fallback: "15",
    isPublic: false,
  },
  accessTokenExpiresIn: {
    key: "auth.accessTokenExpiresIn",
    label: "Access Token",
    fallback: "1h",
    isPublic: false,
  },
  refreshTokenExpiresIn: {
    key: "auth.refreshTokenExpiresIn",
    label: "Refresh Token",
    fallback: "4h",
    isPublic: false,
  },
  allowConcurrentSessions: {
    key: "auth.allowConcurrentSessions",
    label: "동시 로그인 허용",
    fallback: "true",
    isPublic: false,
  },
  adminSessionGuard: {
    key: "auth.adminSessionGuard",
    label: "관리자 세션 검문",
    fallback: "true",
    isPublic: false,
  },
} as const;

export const AUTH_SETTING_KEYS = Object.values(AUTH_SETTING_META).map((item) => item.key);

const toBool = (value: string | null | undefined, fallback: boolean) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
};

export const mapRecordsToAuthSettings = (records: Awaited<ReturnType<typeof getSettingsByKeysQuery>>): AuthSettingsData => {
  const values = new Map(records.map((record) => [record.key, record.value || ""]));

  return {
    registrationEnabled: toBool(values.get(AUTH_SETTING_META.registrationEnabled.key), true),
    accountDeletionEnabled: toBool(values.get(AUTH_SETTING_META.accountDeletionEnabled.key), true),
    defaultUserStatus: (values.get(AUTH_SETTING_META.defaultUserStatus.key) || AUTH_SETTING_META.defaultUserStatus.fallback) as AuthSettingsData["defaultUserStatus"],
    minPasswordLength: Number(values.get(AUTH_SETTING_META.minPasswordLength.key) || AUTH_SETTING_META.minPasswordLength.fallback),
    requirePasswordNumber: toBool(values.get(AUTH_SETTING_META.requirePasswordNumber.key), false),
    requirePasswordLetter: toBool(values.get(AUTH_SETTING_META.requirePasswordLetter.key), false),
    requirePasswordSpecial: toBool(values.get(AUTH_SETTING_META.requirePasswordSpecial.key), false),
    loginFailLimit: Number(values.get(AUTH_SETTING_META.loginFailLimit.key) || AUTH_SETTING_META.loginFailLimit.fallback),
    loginFailWindowMinutes: Number(values.get(AUTH_SETTING_META.loginFailWindowMinutes.key) || AUTH_SETTING_META.loginFailWindowMinutes.fallback),
    loginLockMinutes: Number(values.get(AUTH_SETTING_META.loginLockMinutes.key) || AUTH_SETTING_META.loginLockMinutes.fallback),
    accessTokenExpiresIn: values.get(AUTH_SETTING_META.accessTokenExpiresIn.key) || process.env.ACCESSTOKEN_EXPIRES_IN || AUTH_SETTING_META.accessTokenExpiresIn.fallback,
    refreshTokenExpiresIn: values.get(AUTH_SETTING_META.refreshTokenExpiresIn.key) || process.env.REFRESHTOKEN_EXPIRES_IN || AUTH_SETTING_META.refreshTokenExpiresIn.fallback,
    allowConcurrentSessions: toBool(values.get(AUTH_SETTING_META.allowConcurrentSessions.key), true),
    adminSessionGuard: toBool(values.get(AUTH_SETTING_META.adminSessionGuard.key), true),
  };
};

export const readAuthSettingsCache = async (): Promise<AuthSettingsData | null> => {
  try {
    const cached = await redisClient.get(AUTH_SETTINGS_CACHE_KEY);
    if (!cached) return null;
    return AuthSettingsSchema.parse(JSON.parse(cached));
  } catch {
    return null;
  }
};

export const writeAuthSettingsCache = async (data: AuthSettingsData) => {
  try {
    await redisClient.set(AUTH_SETTINGS_CACHE_KEY, JSON.stringify(data), "EX", SETTINGS_CACHE_TTL);
  } catch {
    // Runtime settings should fall back to DB/defaults if cache is unavailable.
  }
};

export const getAuthSettingsRuntimeAction = async (): Promise<AuthSettingsData> => {
  const cached = await readAuthSettingsCache();
  if (cached) return cached;

  const records = await getSettingsByKeysQuery(AUTH_SETTING_KEYS);
  const data = mapRecordsToAuthSettings(records);
  await writeAuthSettingsCache(data);

  return data;
};

export const toAuthSettingSeeds = (data: AuthSettingsData): SettingSeed[] => [
  {
    key: AUTH_SETTING_META.registrationEnabled.key,
    value: String(data.registrationEnabled),
    group: "auth",
    label: AUTH_SETTING_META.registrationEnabled.label,
    isPublic: AUTH_SETTING_META.registrationEnabled.isPublic,
  },
  {
    key: AUTH_SETTING_META.accountDeletionEnabled.key,
    value: String(data.accountDeletionEnabled),
    group: "auth",
    label: AUTH_SETTING_META.accountDeletionEnabled.label,
    isPublic: AUTH_SETTING_META.accountDeletionEnabled.isPublic,
  },
  {
    key: AUTH_SETTING_META.defaultUserStatus.key,
    value: data.defaultUserStatus,
    group: "auth",
    label: AUTH_SETTING_META.defaultUserStatus.label,
    isPublic: AUTH_SETTING_META.defaultUserStatus.isPublic,
  },
  {
    key: AUTH_SETTING_META.minPasswordLength.key,
    value: String(data.minPasswordLength),
    group: "auth",
    label: AUTH_SETTING_META.minPasswordLength.label,
    isPublic: AUTH_SETTING_META.minPasswordLength.isPublic,
  },
  {
    key: AUTH_SETTING_META.requirePasswordNumber.key,
    value: String(data.requirePasswordNumber),
    group: "auth",
    label: AUTH_SETTING_META.requirePasswordNumber.label,
    isPublic: AUTH_SETTING_META.requirePasswordNumber.isPublic,
  },
  {
    key: AUTH_SETTING_META.requirePasswordLetter.key,
    value: String(data.requirePasswordLetter),
    group: "auth",
    label: AUTH_SETTING_META.requirePasswordLetter.label,
    isPublic: AUTH_SETTING_META.requirePasswordLetter.isPublic,
  },
  {
    key: AUTH_SETTING_META.requirePasswordSpecial.key,
    value: String(data.requirePasswordSpecial),
    group: "auth",
    label: AUTH_SETTING_META.requirePasswordSpecial.label,
    isPublic: AUTH_SETTING_META.requirePasswordSpecial.isPublic,
  },
  {
    key: AUTH_SETTING_META.loginFailLimit.key,
    value: String(data.loginFailLimit),
    group: "auth",
    label: AUTH_SETTING_META.loginFailLimit.label,
    isPublic: AUTH_SETTING_META.loginFailLimit.isPublic,
  },
  {
    key: AUTH_SETTING_META.loginFailWindowMinutes.key,
    value: String(data.loginFailWindowMinutes),
    group: "auth",
    label: AUTH_SETTING_META.loginFailWindowMinutes.label,
    isPublic: AUTH_SETTING_META.loginFailWindowMinutes.isPublic,
  },
  {
    key: AUTH_SETTING_META.loginLockMinutes.key,
    value: String(data.loginLockMinutes),
    group: "auth",
    label: AUTH_SETTING_META.loginLockMinutes.label,
    isPublic: AUTH_SETTING_META.loginLockMinutes.isPublic,
  },
  {
    key: AUTH_SETTING_META.accessTokenExpiresIn.key,
    value: data.accessTokenExpiresIn,
    group: "auth",
    label: AUTH_SETTING_META.accessTokenExpiresIn.label,
    isPublic: AUTH_SETTING_META.accessTokenExpiresIn.isPublic,
  },
  {
    key: AUTH_SETTING_META.refreshTokenExpiresIn.key,
    value: data.refreshTokenExpiresIn,
    group: "auth",
    label: AUTH_SETTING_META.refreshTokenExpiresIn.label,
    isPublic: AUTH_SETTING_META.refreshTokenExpiresIn.isPublic,
  },
  {
    key: AUTH_SETTING_META.allowConcurrentSessions.key,
    value: String(data.allowConcurrentSessions),
    group: "auth",
    label: AUTH_SETTING_META.allowConcurrentSessions.label,
    isPublic: AUTH_SETTING_META.allowConcurrentSessions.isPublic,
  },
  {
    key: AUTH_SETTING_META.adminSessionGuard.key,
    value: String(data.adminSessionGuard),
    group: "auth",
    label: AUTH_SETTING_META.adminSessionGuard.label,
    isPublic: AUTH_SETTING_META.adminSessionGuard.isPublic,
  },
];

export const validatePasswordByAuthSettings = (password: string, settings: AuthSettingsData) => {
  if (password.length < settings.minPasswordLength) {
    return `비밀번호는 ${settings.minPasswordLength}자 이상이어야 합니다.`;
  }

  if (settings.requirePasswordLetter && !/[a-zA-Z]/.test(password)) {
    return "비밀번호에 영문을 포함해주세요.";
  }

  if (settings.requirePasswordNumber && !/\d/.test(password)) {
    return "비밀번호에 숫자를 포함해주세요.";
  }

  if (settings.requirePasswordSpecial && !/[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?`~]/.test(password)) {
    return "비밀번호에 특수문자를 포함해주세요.";
  }

  return null;
};

export const getTokenMaxAge = (expiresIn: string) => timeToSeconds(expiresIn);
