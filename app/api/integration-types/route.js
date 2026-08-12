import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const types = await prisma.integrationType.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(types);
}

export async function POST(req) {
  const body = await req.json();
  const type = await prisma.integrationType.create({ data: { name: body.name, color: body.color || "#2F6F76" } });
  return NextResponse.json(type);
}
