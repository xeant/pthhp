import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { mkdir, writeFile, readdir, unlink, rmdir } from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import prisma from "@/core/utils/db/prisma";
import dayjs from "dayjs";
import { verify } from "@/core/utils/auth/jwtAuth";
import { getUploadSettingsRuntimeAction } from "@/modules/admin/actions/settings.action";
import sharp from "sharp";
import { assertDecodableImage, detectMimeTypeFromBuffer, isMimeCompatibleWithExtension } from "@/core/utils/file/fileValidation";

export const runtime = "nodejs";

const IMAGE_MIMES = new Set(["image/png", "image/jpeg", "image/gif", "image/avif", "image/webp"]);
const AUDIO_MIMES = new Set(["audio/mpeg", "audio/ogg"]);
const VIDEO_MIMES = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const ARCHIVE_MIMES = new Set(["application/zip"]);
const parseAllowedExtensions = (value: string) => {
  return new Set(
    value
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)
      .map((item) => item.startsWith(".") ? item : `.${item}`),
  );
};

const isVideoMime = (mimeType: string) => VIDEO_MIMES.has(mimeType);
const isArchiveMime = (mimeType: string) => ARCHIVE_MIMES.has(mimeType);
const isKnownMime = (mimeType: string) => (
  IMAGE_MIMES.has(mimeType)
  || AUDIO_MIMES.has(mimeType)
  || VIDEO_MIMES.has(mimeType)
  || ARCHIVE_MIMES.has(mimeType)
);
const isSharpProcessableImage = (mimeType: string) => (
  mimeType === "image/jpeg"
  || mimeType === "image/png"
  || mimeType === "image/webp"
  || mimeType === "image/avif"
);

const IMAGE_FORMAT_META = {
  jpeg: { ext: ".jpg", mimeType: "image/jpeg" },
  png: { ext: ".png", mimeType: "image/png" },
  webp: { ext: ".webp", mimeType: "image/webp" },
  avif: { ext: ".avif", mimeType: "image/avif" },
} as const;

const getOriginalImageFormat = (mimeType: string) => {
  if (mimeType === "image/jpeg") return "jpeg";
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "image/avif") return "avif";
  return null;
};

const processImageBuffer = async (
  inputBuffer: Buffer,
  mimeType: string,
  settings: Awaited<ReturnType<typeof getUploadSettingsRuntimeAction>>,
) => {
  const originalFormat = getOriginalImageFormat(mimeType);
  if (!settings.enableImageProcessing || !originalFormat || !isSharpProcessableImage(mimeType)) {
    return {
      buffer: inputBuffer,
      ext: null,
      mimeType,
    };
  }

  let image = sharp(inputBuffer, { animated: false });
  const metadata = await image.metadata();

  if ((metadata.pages || 1) > 1) {
    return {
      buffer: inputBuffer,
      ext: null,
      mimeType,
    };
  }

  image = image
    .rotate()
    .resize({
      width: settings.maxImageWidth,
      height: settings.maxImageHeight,
      fit: "inside",
      withoutEnlargement: true,
    });

  if (!settings.stripImageMetadata) {
    image = image.keepMetadata();
  }

  const outputFormat = settings.imageOutputFormat === "original"
    ? originalFormat
    : settings.imageOutputFormat;
  const outputMeta = IMAGE_FORMAT_META[outputFormat];

  if (outputFormat === "jpeg") {
    const buffer = await image
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: settings.imageQuality, mozjpeg: true })
      .toBuffer();

    return { buffer, ...outputMeta };
  }

  if (outputFormat === "png") {
    const buffer = await image
      .png({ quality: settings.imageQuality, compressionLevel: 9 })
      .toBuffer();

    return { buffer, ...outputMeta };
  }

  if (outputFormat === "webp") {
    const buffer = await image
      .webp({ quality: settings.imageQuality })
      .toBuffer();

    return { buffer, ...outputMeta };
  }

  if (outputFormat === "avif") {
    const buffer = await image
      .avif({ quality: settings.imageQuality })
      .toBuffer();

    return { buffer, ...outputMeta };
  }

  return {
    buffer: inputBuffer,
    ext: null,
    mimeType,
  };
};

// =========================================================================
// POST: 유저 보관함에 파일 업로드
// =========================================================================
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // 1. 인증 확인 (누가 올리는지만 알면 됩니다)
    const accessToken = req.cookies.get("accessToken")?.value;
    if (!accessToken) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    const verifyToken = await verify(accessToken);
    if (!verifyToken || !verifyToken.id) return NextResponse.json({ error: "유효하지 않은 토큰입니다." }, { status: 401 });
    const userId = verifyToken.id;
    const uploadSettings = await getUploadSettingsRuntimeAction();

    // 2. 파일 수신 및 유효성 검사
    const file = formData.get("file-attachments") as unknown as File;
    if (!file || file.size === 0) {
      return NextResponse.json({ error: "파일이 없거나 잘못된 형식입니다." }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    const allowedExts = parseAllowedExtensions(uploadSettings.allowedExtensions);
    const maxFileSize = uploadSettings.maxUploadSizeMb * 1024 * 1024;
    const userStorageLimit = uploadSettings.userStorageLimitMb * 1024 * 1024;

    if (file.size > maxFileSize) {
      return NextResponse.json({ error: `파일은 ${uploadSettings.maxUploadSizeMb}MB 이하만 업로드할 수 있습니다.` }, { status: 400 });
    }

    if (!allowedExts.has(ext)) {
      return NextResponse.json({ error: "허용되지 않은 파일 형식입니다." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const fileBuffer = Buffer.from(bytes);
    const detectedMimeType = detectMimeTypeFromBuffer(fileBuffer);
    const validationMimeType = detectedMimeType || file.type;

    if (!uploadSettings.allowVideo && isVideoMime(validationMimeType)) {
      return NextResponse.json({ error: "동영상 업로드가 허용되어 있지 않습니다." }, { status: 400 });
    }

    if (!uploadSettings.allowArchive && isArchiveMime(validationMimeType)) {
      return NextResponse.json({ error: "압축파일 업로드가 허용되어 있지 않습니다." }, { status: 400 });
    }

    if (uploadSettings.verifyMimeType) {
      if (!detectedMimeType || !isKnownMime(detectedMimeType) || !isMimeCompatibleWithExtension(ext, detectedMimeType)) {
        return NextResponse.json({ error: "파일 실제 형식이 확장자와 일치하지 않습니다." }, { status: 400 });
      }

      try {
        await assertDecodableImage(fileBuffer, detectedMimeType);
      } catch {
        return NextResponse.json({ error: "이미지 파일을 정상적으로 해석할 수 없습니다." }, { status: 400 });
      }
    }

    const processedFile = await processImageBuffer(fileBuffer, validationMimeType, uploadSettings);
    const outputBuffer = processedFile.buffer;
    const outputExt = processedFile.ext || ext;
    const outputMimeType = processedFile.mimeType || file.type;

    if (outputBuffer.byteLength > maxFileSize) {
      return NextResponse.json({ error: `처리된 파일은 ${uploadSettings.maxUploadSizeMb}MB 이하만 저장할 수 있습니다.` }, { status: 400 });
    }

    const storageUsage = await prisma.attachment.aggregate({
      where: { userId },
      _sum: { size: true },
    });
    const currentStorageSize = storageUsage._sum.size || 0;
    if (currentStorageSize + outputBuffer.byteLength > userStorageLimit) {
      return NextResponse.json({ error: `사용자별 보관 용량 ${uploadSettings.userStorageLimitMb}MB를 초과했습니다.` }, { status: 400 });
    }

    // 3. 🌟 물리적 경로 생성 (심볼릭 링크 구조에 맞춤)
    const fileUuid = uuidv4();
    const fileName = `${fileUuid}${outputExt}`;
    const datePath = dayjs().format("YYYY/MM");

    // 물리 저장 경로: 프로젝트루트/storage/uploads/...
    const uploadDir = path.join(
      /* turbopackIgnore: true */ process.cwd(),
      "storage", "uploads", String(userId), datePath
    );
    // DB 저장 경로 (브라우저 접근용): /storage/uploads/...
    const dbPath = `/storage/uploads/${userId}/${datePath}/${fileName}`;

    // 4. 파일 저장
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, fileName), outputBuffer);

    // 5. 📝 DB 기록 (게시글 연결 정보 제외, 유저 소유권만 기록)
    const attachment = await prisma.attachment.create({
      data: {
        uuid: fileUuid,
        fileName: fileName,
        originalName: file.name,
        mimeType: outputMimeType,
        size: outputBuffer.byteLength,
        path: dbPath,
        userId: userId,
      },
    });

    return NextResponse.json(attachment);

  } catch (err) {
    console.error("업로드 오류:", err);
    return NextResponse.json({ error: "업로드 실패" }, { status: 500 });
  }
}

// =========================================================================
// GET: 내 보관함 전체 파일 목록 조회
// =========================================================================
export async function GET(req: NextRequest) {
  try {
    const accessToken = req.cookies.get("accessToken")?.value;
    if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const verifyToken = await verify(accessToken);
    if (!verifyToken || !verifyToken.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const currentUserId = verifyToken.id;

    // 🌟 특정 게시글 조건 없이 "내 파일" 전부 가져오기
    const attachments = await prisma.attachment.findMany({
      where: { userId: currentUserId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(attachments);

  } catch (err) {
    return NextResponse.json({ error: "조회 실패" }, { status: 500 });
  }
}

// =========================================================================
// DELETE: 보관함에서 파일 삭제 (기존 로직 유지)
// =========================================================================
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileId = Number(searchParams.get("fileId"));

    const accessToken = req.cookies.get("accessToken")?.value;
    const verifyToken = await verify(accessToken!);
    const currentUserId = verifyToken?.id;

    const attachment = await prisma.attachment.findUnique({ where: { id: fileId } });
    if (!attachment || attachment.userId !== currentUserId) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    // 물리 파일 삭제 (심볼릭 링크 덕분에 /storage 경로 기준 삭제 가능)
    const filePath = path.join(
      /* turbopackIgnore: true */ process.cwd(),
      attachment.path.substring(1)
    );
    await unlink(filePath).catch(() => {});

    await prisma.attachment.delete({ where: { id: fileId } });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "삭제 실패" }, { status: 500 });
  }
}
