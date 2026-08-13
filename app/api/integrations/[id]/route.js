import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req, { params }) {
  const { id } = await params;
  const body = await req.json();
  const integration = await prisma.integration.update({ where: { id }, data: body, include: { type: true, fromModule: true, toModule: true } });
  return NextResponse.json(integration);
}

export async function DELETE(_req, { params }) {
  const { id } = await params;
  try {
    await prisma.integration.delete({ where: { id } });
  } catch (err) {
    if (err.code !== "P2025") throw err;
  }
  return NextResponse.json({ ok: true });
}
