import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";

export const POST = withAuth(async (req) => {
  const body = await req.json();
  const integration = await prisma.integration.create({
    data: {
      fromId: body.fromId, toId: body.toId, typeId: body.typeId, label: body.label, status: body.status || "backlog",
      fromModuleId: body.fromModuleId || null, toModuleId: body.toModuleId || null,
    },
    include: { type: true, fromModule: true, toModule: true },
  });
  return NextResponse.json(integration);
});
