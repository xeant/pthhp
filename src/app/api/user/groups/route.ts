import { NextResponse, NextRequest } from "next/server";
import prisma from "@/core/utils/db/prisma";
import { verify } from "@/core/utils/auth/jwtAuth";

export async function GET(request: NextRequest): Promise<Response> {
  const accessToken = request.cookies.get("accessToken")?.value;
  const verified = accessToken ? await verify(accessToken) : null;

  if (!verified?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const groups = await prisma.userGroup.findMany({
    select: {
      id: true,
      groupName: true,
      groupTitle: true,
      groupDesc: true,
    },
    orderBy: { id: "asc" },
  });

  return NextResponse.json(
    {
      success: true,
      type: "success",
      data: groups,
    },
    { status: 200 },
  );
}
