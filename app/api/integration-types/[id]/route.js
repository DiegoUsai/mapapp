import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req, { params }) {
  const { id } = await params;
  const body = await req.json();
  const type = await prisma.integrationType.update({ where: { id }, data: body });
  return NextResponse.json(type);
}

export async function DELETE(_req, { params }) {
  const { id } = await params;
  await prisma.integrationType.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
