// src/app/(extentions)/posts/_actions/permission.query.ts

import prisma from "@utils/db/prisma";
import { PermissionData } from "./_type";
import { PermissionSubject } from "@core/utils/db/generated/client";

/**
 * 특정 리소스의 모든 권한 설정 조회
 */
export async function findPermissionsByResource(
  moduleType: string,
  moduleId: number,
): Promise<PermissionData[]> {
  const permissions = await prisma.permission.findMany({
    where: { moduleType, moduleId },
  });

  return permissions.map((p) => ({
    ...p,
    subjectId: p.subjectId ?? undefined,
  }));
}

/**
 * 특정 대상(User/Group 등)에게 부여된 권한 조회
 */
export async function findPermissionsBySubject(
  subjectType: PermissionSubject,
  subjectId?: number,
): Promise<PermissionData[]> {
  const permissions = await prisma.permission.findMany({
    where: { subjectType, subjectId },
  });

  return permissions.map((p) => ({
    ...p,
    subjectId: p.subjectId ?? undefined,
  }));
}

export async function createPermission(data: PermissionData) {
  return prisma.permission.create({
    data: {
      moduleType: data.moduleType,
      moduleId: data.moduleId,
      action: data.action,
      subjectType: data.subjectType,
      subjectId: data.subjectId,
    },
  });
}

export async function updatePermission(id: number, data: PermissionData) {
  return prisma.permission.update({
    where: { id },
    data: {
      moduleType: data.moduleType,
      moduleId: data.moduleId,
      action: data.action,
      subjectType: data.subjectType,
      subjectId: data.subjectId,
    },
  });
}

export async function deletePermission(id: number) {
  return prisma.permission.delete({ where: { id } });
}