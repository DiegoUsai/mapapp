import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const apps = await prisma.application.findMany({
    include: {
      domain: true,
      contracts: { include: { vendor: true } },
      requirements: { include: { sharedWith: true } },
    },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(apps);
}

export async function POST(req) {
  const body = await req.json();
  const app = await prisma.application.create({
    data: {
      name: body.name,
      domainId: body.domainId,
      contracts: { connect: (body.contractIds || []).map((id) => ({ id })) },
    },
    include: { domain: true, contracts: { include: { vendor: true } }, requirements: true },
  });
  return NextResponse.json(app);
}
