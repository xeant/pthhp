// src/utils/trigger/triggerHub.ts
import coreConfig from "@/core/res/config/trigger.json";
import * as coreHandlers from "./triggerHandler";
import { triggerConfig, triggerHandlers } from "@extensions/triggerRegistry";

// 🌟 전역 캐시
let cachedHandlers: any = null;
let cachedConfig: any = null;

function getValueByPath(obj: any, path: string) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

const mergeConfigs = (core: any, user: any) => {
  const merged = { ...core };
  Object.keys(user).forEach((key) => {
    const coreVal = Array.isArray(core[key]) ? core[key] : (core[key] ? [core[key]] : []);
    const userVal = Array.isArray(user[key]) ? user[key] : [user[key]];
    merged[key] = [...coreVal, ...userVal];
  });
  return merged;
};

/**
 * 🌟 초기화 엔진: index.ts만 믿고 갑니다!
 */
async function initializeRegistry() {
  if (cachedHandlers && cachedConfig) return { handlers: cachedHandlers, config: cachedConfig };

  cachedHandlers = { ...coreHandlers, ...triggerHandlers };
  cachedConfig = mergeConfigs(coreConfig, triggerConfig);

  return { handlers: cachedHandlers, config: cachedConfig };
}

export async function dispatchTrigger(type: string, context: any) {
  const { handlers: allHandlers, config: finalConfig } = await initializeRegistry();

  const configs = finalConfig[type];
  if (!configs || !Array.isArray(configs)) return;

  const { result } = context;

  for (const config of configs) {
    const { map, handler: handlerName } = config;
    const mappedData: any = {};

    Object.keys(map).forEach((key) => {
      const pathOrValue = map[key];
      if (typeof pathOrValue === "string" && pathOrValue.includes("{{")) {
        mappedData[key] = pathOrValue.replace(/{{(.*?)}}/g, (_, p) => getValueByPath(result, p.trim()) || "");
      }
      else if (typeof pathOrValue === "string" && getValueByPath(result, pathOrValue) !== undefined) {
        mappedData[key] = getValueByPath(result, pathOrValue);
      }
      else {
        mappedData[key] = pathOrValue;
      }
    });

    const handler = allHandlers[handlerName];
    if (handler) {
      try {
        await handler(mappedData, context);
      } catch (err) {
        console.error(`[Trigger Error] "${handlerName}" 실행 실패:`, err);
      }
    }
  }
}
