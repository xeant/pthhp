import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import mime from "mime-types";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const pathname = url.pathname; // /api/storage/uploads/temp/.../파일.png
    const relativePath = decodeURIComponent(pathname.replace(/^\/api\/storage\/uploads\//, ""));

    if (!relativePath || relativePath.includes("\0") || path.isAbsolute(relativePath)) {
      return NextResponse.json({ error: "유효하지 않은 경로" }, { status: 400 });
    }

    const uploadsRoot = path.resolve(process.cwd(), "storage", "uploads");
    const fileSystemPath = path.resolve(uploadsRoot, relativePath);
    const isInsideUploadsRoot = fileSystemPath === uploadsRoot || fileSystemPath.startsWith(`${uploadsRoot}${path.sep}`);

    if (!isInsideUploadsRoot) {
      return NextResponse.json({ error: "유효하지 않은 경로" }, { status: 400 });
    }

    let fileStat;
    try {
      fileStat = await fs.stat(fileSystemPath);
    } catch {
      return NextResponse.json({ error: "파일을 찾을 수 없습니다." }, { status: 404 });
    }

    if (!fileStat.isFile()) {
      return NextResponse.json({ error: "파일을 찾을 수 없습니다." }, { status: 404 });
    }

    const fileBuffer = await fs.readFile(fileSystemPath);
    const mimeType = mime.lookup(fileSystemPath) || "application/octet-stream";
    const dispositionType = /^(image|audio|video)\//.test(mimeType) ? "inline" : "attachment";

    return new Response(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Length": fileBuffer.length.toString(),
        "Content-Disposition": `${dispositionType}; filename="${encodeURIComponent(path.basename(fileSystemPath))}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Cross-Origin-Resource-Policy": "same-origin",
      },
    });
  } catch (err) {
    console.error("[GET /api/storage/uploads] 오류:", err);
    return NextResponse.json({ error: "서버 오류 발생" }, { status: 500 });
  }
}
