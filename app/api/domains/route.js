import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const domains = await prisma.domain.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(domains);
}

export async function POST(req) {
  const body = await req.json();
  const domain = await prisma.domain.create({
    data: {
      name: body.name,
      color: body.color || "#3E5C76",
      type: body.type || "verticale",
      cofogCode: body.cofogCode || null,
      eurovocUri: body.eurovocUri || null,
    },
  });
  return NextResponse.json(domain);
}
