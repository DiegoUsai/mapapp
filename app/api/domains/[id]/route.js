import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req, { params }) {
  const { id } = await params;
  const body = await req.json();
  const domain = await prisma.domain.update({ where: { id }, data: body });
  return NextResponse.json(domain);
}

export async function DELETE(_req, { params }) {
  const { id } = await params;
  try {
    await prisma.domain.delete({ where: { id } });
  } catch (err) {
    if (err.code !== "P2025") throw err;
  }
  return NextResponse.json({ ok: true });
}
