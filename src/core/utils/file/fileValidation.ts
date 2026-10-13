import path from "path";
import sharp from "sharp";

const MIME_BY_EXT = new Map<string, string[]>([
  [".png", ["image/png"]],
  [".jpg", ["image/jpeg"]],
  [".jpeg", ["image/jpeg"]],
  [".gif", ["image/gif"]],
  [".avif", ["image/avif"]],
  [".webp", ["image/webp"]],
  [".ico", ["image/x-icon", "image/vnd.microsoft.icon"]],
  [".mp3", ["audio/mpeg"]],
  [".ogg", ["audio/ogg"]],
  [".mp4", ["video/mp4"]],
  [".webm", ["video/webm"]],
  [".mov", ["video/quicktime"]],
  [".zip", ["application/zip"]],
]);

const hasBytes = (buffer: Buffer, bytes: number[]) => {
  if (buffer.length < bytes.length) return false;
  return bytes.every((byte, index) => buffer[index] === byte);
};

const hasTextAt = (buffer: Buffer, text: string, offset: number) => {
  if (buffer.length < offset + text.length) return false;
  return buffer.subarray(offset, offset + text.length).toString("ascii") === text;
};

const isIsoBaseMedia = (buffer: Buffer, brands: string[]) => {
  if (!hasTextAt(buffer, "ftyp", 4)) return false;
  const brandWindow = buffer.subarray(8, Math.min(buffer.length, 40)).toString("ascii");
  return brands.some((brand) => brandWindow.includes(brand));
};

export const getMimeTypesForExtension = (fileNameOrExt: string) => {
  const ext = fileNameOrExt.startsWith(".")
    ? fileNameOrExt.toLowerCase()
    : path.extname(fileNameOrExt).toLowerCase();

  return MIME_BY_EXT.get(ext) || [];
};

export const detectMimeTypeFromBuffer = (buffer: Buffer): string | null => {
  if (hasBytes(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (hasBytes(buffer, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (hasTextAt(buffer, "GIF87a", 0) || hasTextAt(buffer, "GIF89a", 0)) return "image/gif";
  if (hasTextAt(buffer, "RIFF", 0) && hasTextAt(buffer, "WEBP", 8)) return "image/webp";
  if (isIsoBaseMedia(buffer, ["avif", "avis"])) return "image/avif";
  if (hasBytes(buffer, [0x00, 0x00, 0x01, 0x00])) return "image/x-icon";
  if (hasBytes(buffer, [0x49, 0x44, 0x33]) || hasBytes(buffer, [0xff, 0xfb]) || hasBytes(buffer, [0xff, 0xf3]) || hasBytes(buffer, [0xff, 0xf2])) return "audio/mpeg";
  if (hasTextAt(buffer, "OggS", 0)) return "audio/ogg";
  if (hasTextAt(buffer, "RIFF", 0) && hasTextAt(buffer, "AVI ", 8)) return "video/avi";
  if (hasTextAt(buffer, "RIFF", 0) && hasTextAt(buffer, "WAVE", 8)) return "audio/wav";
  if (hasBytes(buffer, [0x1a, 0x45, 0xdf, 0xa3])) return "video/webm";
  if (isIsoBaseMedia(buffer, ["mp4", "isom", "iso2", "m4v", "M4V"])) return "video/mp4";
  if (isIsoBaseMedia(buffer, ["qt  "])) return "video/quicktime";
  if (hasBytes(buffer, [0x50, 0x4b, 0x03, 0x04]) || hasBytes(buffer, [0x50, 0x4b, 0x05, 0x06]) || hasBytes(buffer, [0x50, 0x4b, 0x07, 0x08])) return "application/zip";

  return null;
};

export const isMimeCompatibleWithExtension = (fileNameOrExt: string, mimeType: string | null) => {
  if (!mimeType) return false;
  const allowedMimes = getMimeTypesForExtension(fileNameOrExt);
  return allowedMimes.includes(mimeType);
};

export const assertDecodableImage = async (buffer: Buffer, mimeType: string) => {
  if (mimeType === "image/gif" || mimeType === "image/x-icon" || mimeType === "image/vnd.microsoft.icon") return;
  if (!mimeType.startsWith("image/")) return;

  await sharp(buffer, { animated: false }).metadata();
};
