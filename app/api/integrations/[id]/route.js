import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req, { params }) {
  const { id } = await params;
  try {
    await prisma.integration.delete({ where: { id } });
  } catch (err) {
    if (err.code !== "P2025") throw err;
  }
  return NextResponse.json({ ok: true });
}
