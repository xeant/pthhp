"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { verify } from "@utils/auth/jwtAuth";
import * as query from "./attachment.query";
import {ActionState, Attachment} from "@/modules/attachment/actions/_type"; // 쿼리 함수들 임포트

const revalidateAttachmentReferences = (documents: Awaited<ReturnType<typeof query.findDocumentsByThumbnailPath>>) => {
  documents.forEach((document) => {
    revalidatePath(`/posts/${document.module.mid}`);
    revalidatePath(`/posts/${document.module.mid}/${document.slug}`);
  });

  revalidatePath("/user/userUpdate");
};

/**
 * 파일 삭제 액션
 */
export async function deleteAttachment(fileId: number) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    if (!accessToken) return { success: false, error: "로그인이 필요합니다." };

    const verified = await verify(accessToken);
    if (!verified?.id) return { success: false, error: "유효하지 않은 토큰입니다." };

    const attachment = await query.getAttachmentById(fileId);
    if (!attachment) return { success: false, error: "파일을 찾을 수 없습니다." };
    if (attachment.userId !== verified.id) return { success: false, error: "삭제 권한이 없습니다." };

    const thumbnailDocuments = await query.findDocumentsByThumbnailPath(attachment.path);

    await query.deleteAttachmentPhysical(fileId);
    revalidateAttachmentReferences(thumbnailDocuments);

    return { success: true };
  } catch (error) {
    return { success: false, error: "삭제 실패" };
  }
}

/**
 * 내 파일 목록 조회 액션
 */
export async function getMyFiles(page: number = 1) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  if (!accessToken) throw new Error("로그인 필요");

  const decoded = await verify(accessToken);
  if (!decoded?.id) throw new Error("잘못된 토큰");

  const pageSize = 10;
  const { items, totalCount } = await query.getUserAttachments(decoded.id, page, pageSize);

  return {
    items,
    pagination: {
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
      pageSize,
    },
  };
}

export async function deleteAttachmentAction(fileId: number): Promise<ActionState<null>> {
  try {
    // 1. 로그인 및 권한 체크 (기존과 동일)
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const decoded = accessToken ? await verify(accessToken) : null;

    if (!decoded) return { success: false, type: "error", message: "권한이 없습니다." };

    // 2. 파일 소유권 확인
    const attachment = await query.findAttachmentForAuth(fileId);
    if (!attachment) return { success: false, type: "error", message: "파일을 찾을 수 없습니다." };

    if (attachment.userId !== decoded.id && !Boolean(decoded.isAdmin)) {
      return { success: false, type: "error", message: "삭제 권한이 없습니다." };
    }

    const thumbnailDocuments = await query.findDocumentsByThumbnailPath(attachment.path);

    // 3. 🌟 [변경] 연결 해제가 아니라 '진짜 삭제'를 호출합니다.
    // 이전에 만들어둔 물리 파일 삭제 + DB 삭제 로직이 담긴 쿼리를 호출하세요.
    await query.deleteAttachmentPhysical(fileId);
    revalidateAttachmentReferences(thumbnailDocuments);

    return {
      success: true,
      type: "success",
      message: "보관함에서 영구 삭제되었습니다."
    };
  } catch (error) {
    console.error("deleteAttachmentAction 에러:", error);
    return { success: false, type: "error", message: "파일 삭제 중 오류가 발생했습니다." };
  }
}

export async function getAttachmentsAction(): Promise<ActionState<Attachment[]>> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    // 1. 인증 확인
    if (!accessToken) {
      return { success: false, type: "error", message: "로그인이 필요합니다.", data: [] };
    }

    const decoded = await verify(accessToken);
    const userId = decoded?.id;

    if (!userId) {
      return { success: false, type: "error", message: "유효하지 않은 유저 정보입니다.", data: [] };
    }

    // 🌟 [변경] 이제 target(documentId, tempId) 없이 userId로만 조회합니다!
    const items = await query.findAttachmentsByUser(userId);

    return {
      success: true,
      type: "success",
      message: "보관함 조회 성공",
      data: items.map(att => ({
        id: att.id,
        uuid: att.uuid,
        name: att.originalName, // DB 필드명과 잘 맞추셨네요!
        size: att.size,
        path: att.path,
        mimeType: att.mimeType,
      })),
    };
  } catch (error) {
    console.error("getAttachmentsAction 에러:", error);
    return { success: false, type: "error", message: "목록 조회 실패", data: [] };
  }
}
