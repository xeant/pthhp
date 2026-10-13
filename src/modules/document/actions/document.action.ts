// src/app/(extentions)/posts/_actions/document.action.ts
'use server'

import { cookies } from "next/headers";
import { verify } from "@utils/auth/jwtAuth";
import crypto from "crypto";
import dayjs from "dayjs";
import * as query from "./document.query";
import { revalidatePath } from "next/cache";
import * as postsQuery from "@/modules/posts/actions/posts.query"; // 게시판 정보 조회를 위해 필요
import { ActionState, DocumentUpsertSchema, DocumentInfo } from "./_type";
import { validateForm } from "@utils/validation/formValidator";
import * as documentQuery from "@/modules/document/actions/document.query";
import {withTrigger} from "@utils/trigger/triggerWrapper";
import {CommentWithChildren} from "@/modules/comment/actions/_type";
import { nanoid } from "nanoid";
import { getPostSkinCapability } from "@/modules/posts/actions/skinCapability";
import { hashedPassword, verifyPassword } from "@/core/utils/auth/password";

// 내부 유틸: 로그인 유저 확인
async function getLoggedInfo() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  if (!accessToken) return null;
  const verified = await verify(accessToken);
  if (!verified?.id) return null;
  return { id: verified.id, isAdmin: Boolean(verified.isAdmin) };
}

const SECRET_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function getSecretCookieName(slug: string) {
  return `post_secret_${slug}`;
}

function createSecretCookieValue(slug: string) {
  const secret = process.env.SECRET_KEY || process.env.JWT_SECRET || "plextype-secret";
  return crypto.createHmac("sha256", secret).update(`post:${slug}`).digest("hex");
}

async function hasDocumentSecretAccess(document: any, loggedInfo?: { id: number; isAdmin: boolean } | null) {
  if (!document?.isSecrets) return true;
  if (document.userId && document.userId === loggedInfo?.id) return true;
  if (loggedInfo?.isAdmin) return true;

  const cookieStore = await cookies();
  return cookieStore.get(getSecretCookieName(document.slug))?.value === createSecretCookieValue(document.slug);
}

function sanitizeDocument(document: any) {
  if (!document) return document;
  const { authorPassword, ...safeDocument } = document;
  return safeDocument;
}

function toLockedDocument(document: any) {
  return {
    ...sanitizeDocument(document),
    content: null,
    thumbnail: null,
    _secretLocked: true,
  };
}

export async function getDocument(id: number): Promise<ActionState<DocumentInfo>> {
  try {
    const document = await documentQuery.findDocument(id);
    if (!document) {
      return {
        success: false,
        type: "error",
        message: "존재하지 않는 게시글입니다."
      };
    }

    // ✅ 성공 시에도 message와 type을 명시하여 ActionState 규격을 맞춥니다.
    return {
      success: true,
      type: "success", // 생략 가능하게 정의되어 있지 않다면 추가
      message: "게시글 조회 성공",
      data: document as DocumentInfo
    };
  } catch (error) {
    console.error("getDocument 에러:", error);
    return {
      success: false,
      type: "error",
      message: "게시글을 불러오는 중 오류가 발생했습니다."
    };
  }
}

export async function getDocumentDeleteInfoAction(slug?: string): Promise<ActionState<{ id: number; userId: number | null; title: string | null }>> {
  try {
    const loggedInfo = await getLoggedInfo();
    if (!loggedInfo) return { success: false, type: "error", message: "로그인이 필요합니다." };
    if (!slug) return { success: false, type: "error", message: "게시글 주소가 올바르지 않습니다." };

    const document = await documentQuery.findDocumentDeleteInfoBySlug(slug);
    if (!document) return { success: false, type: "error", message: "존재하지 않는 글입니다." };

    if (document.userId !== loggedInfo.id && !loggedInfo.isAdmin) {
      return { success: false, type: "error", message: "본인이 작성한 글만 삭제할 수 있습니다." };
    }

    return {
      success: true,
      type: "success",
      message: "게시글 삭제 정보 조회 성공",
      data: document,
    };
  } catch (error) {
    console.error("getDocumentDeleteInfoAction 에러:", error);
    return { success: false, type: "error", message: "삭제 정보를 불러오는 중 오류가 발생했습니다." };
  }
}

// ==========================================
// [ACTION - Document] 게시글 저장/수정
// ==========================================
// src/app/(extentions)/posts/_actions/document.action.ts
export const saveDocument = withTrigger("document.saved",  async (mid: string, formData: FormData, paths?: string): Promise<ActionState<any>> => {
  try {
    const loggedInfo = await getLoggedInfo();
    if (!loggedInfo) return { success: false, type: "error", message: "로그인이 필요합니다." };

    const postInfo = await postsQuery.findModuleByMid(mid);
    if (!postInfo) return { success: false, type: "error", message: "존재하지 않는 게시판입니다." };

    // 🌟 [추가] 확장 필드 데이터 추출 로직
    const extraFieldData: Record<string, any> = {};
    formData.forEach((value, key) => {
      if (key.startsWith("extraData__")) {
        const cleanKey = key.replace("extraData__", "");
        extraFieldData[cleanKey] = value === "true" ? true : value === "false" ? false : value;
      }
    });

    const formPayload = {
      id: formData.get("id"),
      categoryId: formData.get("categoryId"),
      title: formData.get("title"),
      content: formData.get("content"),
      thumbnail: formData.get("thumbnail"),
      isNotice: formData.get("isNotice"),
      isSecrets: formData.get("isSecrets"),
      secretPassword: formData.get("secretPassword"),
      moduleId: postInfo.id,
      moduleType: "posts",
      tempId: formData.get("tempId"),
      // 🌟 추출한 데이터를 페이로드에 포함
      extraFieldData: extraFieldData,
    };

    // validation 시 DocumentUpsertSchema에 extraFieldData가 정의되어 있어야 합니다.
    const validation = validateForm(DocumentUpsertSchema, formPayload);
    if (!validation.isValid) return validation.errorResponse;
    const data = validation.data;
    const thumbnail = data.thumbnail || extractFirstImageFromContent(data.content) || null;
    const postSkinCapability = getPostSkinCapability(postInfo.config);
    const defaultDocumentStatus = postSkinCapability.documentStatus?.defaultStatus;
    const useSecretPost = Boolean((postInfo.config as any)?.secretPost);

    let resultData: any;

    if (data.id) {
      const existing = await documentQuery.findDocument(data.id);
      if (!existing) return { success: false, type: "error", message: "글을 찾을 수 없습니다." };
      if (existing.userId !== loggedInfo.id && !loggedInfo.isAdmin) {
        return { success: false, type: "error", message: "수정 권한이 없습니다." };
      }

      let authorPassword = (existing as any).authorPassword || null;
      if (!useSecretPost && data.isSecrets) {
        return {
          success: false,
          type: "error",
          message: "이 게시판은 비밀글을 사용할 수 없습니다.",
          fieldErrors: { isSecrets: "이 게시판은 비밀글을 사용할 수 없습니다." },
        };
      }
      if (data.isSecrets) {
        const secretPassword = String(data.secretPassword || "").trim();
        if (secretPassword) authorPassword = await hashedPassword(secretPassword);
        if (!authorPassword) {
          return {
            success: false,
            type: "error",
            message: "비밀글 비밀번호를 입력해주세요.",
            fieldErrors: { secretPassword: "비밀글 비밀번호를 입력해주세요." },
          };
        }
      } else {
        authorPassword = null;
      }

      // 🌟 업데이트 시 extraFieldData 포함
      const updated = await documentQuery.updateDocument(data.id, {
        title: data.title,
        content: data.content,
        thumbnail,
        categoryId: data.categoryId,
        isNotice: data.isNotice,
        isSecrets: data.isSecrets,
        authorPassword,
        extraFieldData: data.extraFieldData, // 추가
        updatedAt: new Date()
      });

      resultData = { ...updated, _isNew: false };
    } else {
      let authorPassword: string | null = null;
      if (!useSecretPost && data.isSecrets) {
        return {
          success: false,
          type: "error",
          message: "이 게시판은 비밀글을 사용할 수 없습니다.",
          fieldErrors: { isSecrets: "이 게시판은 비밀글을 사용할 수 없습니다." },
        };
      }
      if (data.isSecrets) {
        const secretPassword = String(data.secretPassword || "").trim();
        if (!secretPassword) {
          return {
            success: false,
            type: "error",
            message: "비밀글 비밀번호를 입력해주세요.",
            fieldErrors: { secretPassword: "비밀글 비밀번호를 입력해주세요." },
          };
        }
        authorPassword = await hashedPassword(secretPassword);
      }

      // 🌟 신규 등록 시 extraFieldData 포함
      const created = await documentQuery.insertDocument({
        moduleType: data.moduleType,
        moduleId: data.moduleId,
        title: data.title,
        content: data.content,
        thumbnail,
        userId: loggedInfo.id,
        categoryId: data.categoryId,
        isNotice: data.isNotice,
        isSecrets: data.isSecrets,
        authorPassword,
        status: defaultDocumentStatus,
        extraFieldData: data.extraFieldData, // 추가
        slug: nanoid(10),
        authorName: "작성자",
        published: true,
      });

      resultData = { ...created, _isNew: true };
    }

    if (paths) {
      revalidatePath(paths);
    }

    return { success: true, type: "success", message: "저장되었습니다.", data: resultData };
  } catch (error) {
    console.error("saveDocument 에러:", error);
    return { success: false, type: "error", message: "게시글 저장 중 오류가 발생했습니다." };
  }
});

// ==========================================
// [ACTION - Document] 게시글 목록 조회 (썸네일 파싱 포함)
// ==========================================
function extractTiptapText(nodes: any[]): string {
  return nodes
    .map((node) => {
      if (node.type === "text" && node.text) return node.text;
      if (Array.isArray(node.content)) return extractTiptapText(node.content);
      return "";
    })
    .filter(Boolean)
    .join(" ");
}

function findTiptapImage(nodes: any[]): string | null {
  for (const node of nodes) {
    if (node.type === "image" && node.attrs?.src) return node.attrs.src;
    if (Array.isArray(node.content)) {
      const nested = findTiptapImage(node.content);
      if (nested) return nested;
    }
  }

  return null;
}

function extractFirstImageFromContent(content?: string | null): string | null {
  if (!content) return null;

  try {
    let parsed = JSON.parse(content);
    if (typeof parsed === "string") parsed = JSON.parse(parsed);

    if (parsed?.type === "doc" && Array.isArray(parsed.content)) {
      return findTiptapImage(parsed.content);
    }

    if (Array.isArray(parsed?.blocks)) {
      const imageBlock = parsed.blocks.find((block: any) => block?.type === "image");
      return imageBlock?.data?.file?.url || null;
    }
  } catch (e) {
    return content.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] || null;
  }

  return null;
}

function normalizeCommentPreview(content?: string | null): { content: string; image: string | null } {
  if (!content) return { content: "", image: null };

  const cleanText = (text: string) => text
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const toPreview = (text: string) => {
    const normalized = cleanText(text);
    return normalized.length > 120 ? `${normalized.slice(0, 120).trim()}...` : normalized;
  };

  try {
    let parsed = JSON.parse(content);
    if (typeof parsed === "string") parsed = JSON.parse(parsed);

    if (parsed?.type === "doc" && Array.isArray(parsed.content)) {
      const image = findTiptapImage(parsed.content);
      const preview = toPreview(extractTiptapText(parsed.content));

      return {
        content: preview || (image ? "이미지" : ""),
        image,
      };
    }

    if (Array.isArray(parsed?.blocks)) {
      const imageBlock = parsed.blocks.find((block: any) => block?.type === "image");
      const image = imageBlock?.data?.file?.url || null;
      const preview = toPreview(
        parsed.blocks
          .map((block: any) => block?.data?.text || block?.data?.caption || "")
          .join(" ")
      );

      return {
        content: preview || (image ? "이미지" : ""),
        image,
      };
    }
  } catch (e) {
    const image = content.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] || null;
    const preview = toPreview(content);

    return {
      content: preview || (image ? "이미지" : ""),
      image,
    };
  }

  return {
    content: toPreview(content),
    image: null,
  };
}

function isOwnerOnlyBoard(config: any) {
  return Boolean(config?.consultingState);
}

export async function getDocumentList(
  mid: string,
  page: number = 1,
  pageSize: number = 10,
  categoryId?: string,
  status?: string
): Promise<ActionState<any>> {
  try {
    // 1. 게시판(모듈) 정보 확인
    const postInfo = await postsQuery.findModuleByMid(mid);
    if (!postInfo) return { success: false, type: "error", message: "게시판을 찾을 수 없습니다." };

    const parsedCategoryId = categoryId ? Number(categoryId) : undefined;
    const loggedInfo = await getLoggedInfo();
    const ownerId = isOwnerOnlyBoard(postInfo.config) && !loggedInfo?.isAdmin
      ? (loggedInfo?.id || 0)
      : undefined;
    const postSkinCapability = getPostSkinCapability(postInfo.config);
    const defaultDocumentStatus = postSkinCapability.documentStatus?.defaultStatus;
    const statusFilter = defaultDocumentStatus
      ? (status || defaultDocumentStatus)
      : status;

    // 🌟 [중요] documentQuery.findDocumentList에서 extraFieldData를 select/include 하고 있는지 확인해야 합니다.
    const { items, totalCount } = await documentQuery.findDocumentList(postInfo.id, page, pageSize, parsedCategoryId, ownerId, statusFilter);
    const statusCounts = postSkinCapability.documentStatus?.useStatusCounts
      ? await documentQuery.countIssueStatuses(postInfo.id, parsedCategoryId, ownerId)
      : undefined;

    const formattedItems = items.map((doc: any) => {
      const secretLocked = Boolean(doc.isSecrets) &&
        doc.userId !== loggedInfo?.id &&
        !loggedInfo?.isAdmin;
      let previewContent = "";
      let thumbnail: string | null = doc.thumbnail || null;

      // --- 기존 컨텐츠 파싱 로직 (유지) ---
      if (!secretLocked && doc.content) {
        try {
          let rawContent = doc.content;
          if (rawContent.startsWith('"') && rawContent.endsWith('"')) rawContent = rawContent.slice(1, -1);
          const parsed = JSON.parse(rawContent);

          if (parsed.type === "doc" && Array.isArray(parsed.content)) {
            const findFirstImage = (nodes: any[]): string | null => {
              for (const node of nodes) {
                if (node.type === 'image' && node.attrs?.src) return node.attrs.src;
                if (node.content) {
                  const nested = findFirstImage(node.content);
                  if (nested) return nested;
                }
              }
              return null;
            };
            thumbnail = thumbnail || findFirstImage(parsed.content) || "";

            const extractText = (nodes: any[]): string => {
              let text = "";
              nodes.forEach(n => {
                if (n.type === "text" && n.text) text += n.text;
                else if (n.content) text += extractText(n.content) + " ";
              });
              return text;
            };
            const fullText = extractText(parsed.content);
            previewContent = fullText.length > 150 ? fullText.slice(0, 150).trim() + "..." : fullText.trim();
          } else if (parsed.blocks) {
            const imageBlock = parsed.blocks.find((b: any) => b.type === 'image');
            if (!thumbnail && imageBlock?.data?.file?.url) thumbnail = imageBlock.data.file.url;
            previewContent = parsed.blocks.slice(0, 3).map((b: any) => (b.data?.text || "").replace(/<[^>]+>/g, "")).join(" ");
          }
        } catch (e) {
          previewContent = doc.content.replace(/<[^>]+>/g, "").slice(0, 150);
        }
      }

      // 🌟 [추가] extraFieldData가 문자열로 저장되어 있을 경우를 대비한 안전한 파싱
      let extraFieldData = doc.extraFieldData || {};
      if (typeof extraFieldData === 'string') {
        try {
          extraFieldData = JSON.parse(extraFieldData);
        } catch (e) {
          extraFieldData = {};
        }
      }

      const latestCommentPreview = doc.Comment && doc.Comment.length > 0
        ? normalizeCommentPreview(doc.Comment[0].content)
        : null;

      const latestComment = latestCommentPreview
        ? {
          ...doc.Comment[0],
          content: latestCommentPreview.content,
          image: latestCommentPreview.image,
        }
        : null;

      return {
        ...doc,
        title: secretLocked ? "비밀글입니다." : doc.title,
        content: secretLocked ? "비밀번호가 필요한 글입니다." : previewContent,
        thumbnail: secretLocked ? null : thumbnail,
        extraFieldData,
        latestComment: secretLocked ? null : latestComment,
        _secretLocked: secretLocked,
      };
    });

    return {
      success: true,
      message: "조회 성공",
      data: {
        documentList: formattedItems,
        navigation: {
          totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
          page,
          listCount: formattedItems.length
        },
        statusCounts,
      }
    };
  } catch (error) {
    console.error("getDocumentList 에러:", error);
    return { success: false, type: "error", message: "목록 조회 중 오류가 발생했습니다." };
  }
}

// ==========================================
// [ACTION - Document] 게시글 삭제
// ==========================================
export const removeDocumentAction = withTrigger("document.removed", async (id: number, mid: string): Promise<ActionState<any>> => {
  try {
    const loggedInfo = await getLoggedInfo();
    if (!loggedInfo) return { success: false, type: "error", message: "로그인이 필요합니다." };

    // 🌟 1. 삭제 전, 해당 문서를 미리 찾아둡니다. (이미 로직에 있네요!)
    const doc = await documentQuery.findDocument(id);
    if (!doc) return { success: false, type: "error", message: "이미 삭제되었거나 존재하지 않는 글입니다." };

    if (doc.userId !== loggedInfo.id && !loggedInfo.isAdmin) {
      return { success: false, type: "error", message: "삭제 권한이 없습니다." };
    }

    // 🌟 2. DB에서 삭제를 진행합니다.
    await documentQuery.deleteDocument(id);

    revalidatePath(`/posts/${mid}`);

    // 🌟 3. 결과 데이터(data)에 삭제된 문서 정보를 통째로 담아서 보냅니다.
    // 이렇게 해야 트리거가 "누가 쓴 어떤 글이 지워졌나"를 알 수 있습니다.
    return {
      success: true,
      type: "success",
      message: "게시글이 삭제되었습니다.",
      data: doc
    };
  } catch (error) {
    console.error("removeDocument 에러:", error);
    return { success: false, type: "error", message: "삭제 중 오류가 발생했습니다." };
  }
});

export const removeDocument = removeDocumentAction;


/**
 * [Action] 조회수 증가 (1시간 중복 방지)
 */
export async function increaseViewCount(documentId: number, userId?: number, ip?: string): Promise<void> {
  try {
    const oneHourAgo = dayjs().subtract(1, "hour").toDate();

    // 1. 최근 조회 기록 확인 (Query 호출)
    const exists = await query.findRecentViewLog(documentId, oneHourAgo, userId, ip);

    // 2. 기록이 없으면 증가 (Query 트랜잭션 호출)
    if (!exists) {
      await query.incrementReadCountWithLog(documentId, userId, ip);
    }
  } catch (error) {
    // 조회수 증가는 실패해도 사용자 서비스에 치명적이지 않으므로 로그만 남깁니다.
    console.error("increaseViewCount 에러:", error);
  }
}

export async function getDocumentBySlugAction(slug: string): Promise<ActionState<DocumentInfo>> {
  try {
    const document = await documentQuery.findDocumentBySlug(slug); // 🌟 Query에 추가할 함수
    if (!document) {
      return { success: false, type: "error", message: "존재하지 않는 게시글입니다." };
    }

    const loggedInfo = await getLoggedInfo();
    if (
      isOwnerOnlyBoard(document.module?.config) &&
      document.userId !== loggedInfo?.id &&
      !loggedInfo?.isAdmin
    ) {
      return { success: false, type: "error", message: "게시글을 조회할 권한이 없습니다." };
    }

    if (!(await hasDocumentSecretAccess(document, loggedInfo))) {
      return {
        success: true,
        type: "warning",
        message: "비밀글입니다.",
        data: toLockedDocument(document) as DocumentInfo,
      };
    }

    return {
      success: true,
      type: "success",
      message: "게시글 조회 성공",
      data: sanitizeDocument(document) as DocumentInfo
    };
  } catch (error) {
    return { success: false, type: "error", message: "조회 중 오류 발생" };
  }
}

export async function unlockDocumentSecretAction(slug: string, password: string): Promise<ActionState<null>> {
  try {
    const document = await documentQuery.findDocumentBySlug(slug);
    if (!document) return { success: false, type: "error", message: "존재하지 않는 게시글입니다." };
    if (!document.isSecrets) return { success: true, type: "success", message: "비밀글이 아닙니다." };

    const inputPassword = String(password || "").trim();
    if (!inputPassword) {
      return {
        success: false,
        type: "error",
        message: "비밀번호를 입력해주세요.",
        fieldErrors: { password: "비밀번호를 입력해주세요." },
      };
    }

    if (!document.authorPassword) {
      return { success: false, type: "error", message: "비밀글 비밀번호가 설정되어 있지 않습니다." };
    }

    const isValid = await verifyPassword(inputPassword, document.authorPassword);
    if (!isValid) {
      return {
        success: false,
        type: "error",
        message: "비밀번호가 일치하지 않습니다.",
        fieldErrors: { password: "비밀번호가 일치하지 않습니다." },
      };
    }

    const cookieStore = await cookies();
    cookieStore.set(getSecretCookieName(slug), createSecretCookieValue(slug), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SECRET_COOKIE_MAX_AGE,
    });

    return { success: true, type: "success", message: "비밀글 열람이 허용되었습니다." };
  } catch (error) {
    return { success: false, type: "error", message: "비밀글 확인 중 오류가 발생했습니다." };
  }
}
