import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  const body = await req.json();
  const requirement = await prisma.requirement.create({
    data: {
      applicationId: body.applicationId,
      moduleId: body.moduleId || null,
      name: body.name,
      status: body.status || "backlog",
      externalId: body.externalId || null,
      externalSystem: body.externalSystem || null,
      ...(body.shareWithId ? { sharedWith: { connect: { id: body.shareWithId } } } : {}),
    },
    include: { sharedWith: true, module: true },
  });
  return NextResponse.json(requirement);
}
