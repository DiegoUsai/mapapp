import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req, { params }) {
  const { id } = await params;
  await prisma.integration.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
