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
  const count = await prisma.integration.count({ where: { typeId: id } });
  if (count > 0) {
    return NextResponse.json({ error: "Tipologia in uso da integrazioni collegate", count }, { status: 409 });
  }
  try {
    await prisma.integrationType.delete({ where: { id } });
  } catch (err) {
    if (err.code !== "P2025") throw err;
  }
  return NextResponse.json({ ok: true });
}
