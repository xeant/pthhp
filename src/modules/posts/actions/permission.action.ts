// src/app/(extentions)/posts/_actions/permission.action.ts
"use server";

import { Permission, Permissions, CurrentUser } from "./_type";
import * as permission from "./permission";

export const hasPermissionAction = async (
  permissions: Permission[],
  currentUser: CurrentUser | null,
): Promise<boolean> => {
  return await permission.hasPermission(permissions, currentUser);
};

export async function checkPermissionsAction(
  permissions: Permissions,
  currentUser: CurrentUser | null,
) {
  return await permission.checkPermissions(permissions, currentUser);
}
