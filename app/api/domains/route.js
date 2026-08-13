import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";

export const GET = withAuth(async () => {
  const domains = await prisma.domain.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(domains);
});

export const POST = withAuth(async (req) => {
  const body = await req.json();
  const domain = await prisma.domain.create({
    data: {
      name: body.name,
      color: body.color || "#3E5C76",
      ambito: body.ambito || "verticale",
      core: body.core || false,
      cofogCode: body.cofogCode || null,
    },
  });
  return NextResponse.json(domain);
});
