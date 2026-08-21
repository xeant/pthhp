import { postSkinCapabilities } from "@extensions/postCapabilities";

export function getPostSkinCapability(config: unknown) {
  const skin = typeof (config as any)?.skin === "string"
    ? (config as any).skin.trim().toLowerCase()
    : "";

  return postSkinCapabilities[skin] || {};
}
