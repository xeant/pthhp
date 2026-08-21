
export function extractUploadPaths(content: string | null): string[] {
  if (!content) return [];

  // /storage/uploads/로 시작해서 따옴표나 공백 전까지의 문자열을 모두 찾습니다.
  const regex = /\/storage\/uploads\/[^\s"'>]+/g;
  const matches = content.match(regex);

  // 중복 제거해서 반환
  return matches ? Array.from(new Set(matches)) : [];
}