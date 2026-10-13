export const hasClientSession = async () => {
  try {
    const response = await fetch("/api/auth/me", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) return false;

    const data = await response.json().catch(() => null);
    return Boolean(data?.isLoggedIn && data?.id);
  } catch {
    return false;
  }
};
