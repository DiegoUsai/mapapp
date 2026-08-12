import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req, { params }) {
  const { id } = await params;
  const body = await req.json();
  const app = await prisma.application.update({
    where: { id },
    data: body,
    include: { domain: true, contract: { include: { vendor: true } }, requirements: true },
  });
  return NextResponse.json(app);
}

export async function DELETE(_req, { params }) {
  const { id } = await params;
  await prisma.application.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
