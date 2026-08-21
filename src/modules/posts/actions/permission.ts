import { Permission, Permissions, CurrentUser } from "./_type";

export const hasPermission = async (
  permissions: Permission[],
  currentUser: CurrentUser | null,
): Promise<boolean> => {
  if (currentUser?.isAdmin === true) {
    return true;
  }

  if (!permissions || permissions.length === 0) {
    return true;
  }

  return permissions.some((p) => {
    if (p.subjectType === "guest") return true;

    if (p.subjectType === "member") return !!currentUser?.loggedIn;

    if (p.subjectType === "group" && currentUser?.groups) {
      return currentUser.groups.map(Number).includes(Number(p.subjectId));
    }

    if (p.subjectType === "admin") return !!currentUser?.isAdmin;

    return false;
  });
};

export async function checkPermissions(
  permissions: Permissions,
  currentUser: CurrentUser | null,
) {
  if (currentUser?.isAdmin === true) {
    return {
      doList: true,
      doRead: true,
      doWrite: true,
      doComment: true,
    };
  }

  const [doList, doRead, doWrite, doComment] = await Promise.all([
    hasPermission(permissions.listPermissions, currentUser),
    hasPermission(permissions.readPermissions, currentUser),
    hasPermission(permissions.writePermissions, currentUser),
    hasPermission(permissions.commentPermissions, currentUser),
  ]);

  return { doList, doRead, doWrite, doComment };
}
