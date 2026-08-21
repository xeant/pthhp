// src/app/(extentions)/posts/_actions/attachment.query.ts
import prisma from "@utils/db/prisma";
import { unlink, readdir, rmdir } from "fs/promises";
import path from "path";

// 2. DB 내 경로 문자열 일괄 치환 (Raw Query)
export async function updateAttachmentPathStrings(documentId: number, moduleType: string, oldPrefix: string, newPrefix: string) {
  return prisma.$executeRaw`
      UPDATE "Attachment"
      SET "path" = REPLACE("path", ${oldPrefix}, ${newPrefix})
      WHERE "documentId" = ${documentId}
        AND "moduleType" = ${moduleType}
  `;
}

// 3. 게시글 본문 조회 및 업데이트
export async function getDocumentContent(id: number) {
  return prisma.document.findUnique({
    where: {id},
    select: {content: true},
  });
}

export async function updateDocumentContent(id: number, content: string) {
  return prisma.document.update({
    where: {id},
    data: {content},
  });
}

// 4. 단일 첨부파일 정보 조회
export async function getAttachmentById(id: number) {
  return prisma.attachment.findUnique({
    where: {id},
  });
}

// 5. 첨부파일 DB 삭제
export async function deleteAttachmentFromDb(id: number) {
  return prisma.attachment.delete({
    where: {id},
  });
}

export async function findDocumentsByThumbnailPath(thumbnail: string) {
  return prisma.document.findMany({
    where: { thumbnail },
    select: {
      slug: true,
      module: {
        select: {
          mid: true,
        },
      },
    },
  });
}

// 6. 내 파일 목록 조회 (페이징 포함)
export async function getUserAttachments(userId: number, page: number, pageSize: number) {
  const skip = (page - 1) * pageSize;

  const [totalCount, items] = await Promise.all([
    prisma.attachment.count({ where: { userId } }),
    prisma.attachment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        fileName: true,
        originalName: true,
        mimeType: true,
        size: true,
        path: true,
      },
    }),
  ]);

  return { items, totalCount };
}


export async function deleteAttachmentPhysical(id: number) {
  // 1. DB에서 파일 정보 먼저 가져오기 (경로를 알아야 지우니까요)
  const attachment = await prisma.attachment.findUnique({
    where: { id },
  });

  if (!attachment) return null;


  const filePath = path.join(
    /* turbopackIgnore: true */ process.cwd(),
    attachment.path.substring(1)
  );

  try {
    // 3. 실제 파일 삭제
    await unlink(filePath);

    // 4. 빈 폴더 정리 (선택 사항: 날짜 폴더가 비었으면 삭제)
    const folderPath = path.dirname(filePath);
    const filesInFolder = await readdir(folderPath);
    if (filesInFolder.length === 0) {
      await rmdir(folderPath);
    }
  } catch (err: any) {
    // 파일이 이미 없더라도(ENOENT) 에러 내지 않고 진행 (DB만이라도 지워야 하니까요)
    if (err.code !== "ENOENT") console.error("물리 파일 삭제 중 오류:", err);
  }

  // 5. DB 레코드 최종 삭제 + 삭제된 파일을 바라보는 대표 이미지 참조 정리
  const [, , deletedAttachment] = await prisma.$transaction([
    prisma.document.updateMany({
      where: { thumbnail: attachment.path },
      data: { thumbnail: null },
    }),
    prisma.profile.updateMany({
      where: { profileImage: attachment.path },
      data: { profileImage: null },
    }),
    prisma.attachment.delete({
      where: { id },
    }),
  ]);

  return deletedAttachment;
}


// ✅ 보안 체크는 살아남았습니다.
export async function findAttachmentForAuth(id: number) {
  return prisma.attachment.findUnique({
    where: { id },
    select: { id: true, userId: true, path: true },
  });
}

// ✅ 이제는 "어디에 있느냐"가 아니라 "누구 것이냐"만 중요합니다.
export async function findAttachmentsByUser(userId: number) {
  return prisma.attachment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}
