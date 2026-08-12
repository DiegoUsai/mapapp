import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req, { params }) {
  const { id } = await params;
  const body = await req.json();
  const requirement = await prisma.requirement.update({
    where: { id },
    data: body,
    include: { sharedWith: true },
  });
  return NextResponse.json(requirement);
}

export async function DELETE(_req, { params }) {
  const { id } = await params;
  try {
    await prisma.requirement.delete({ where: { id } });
  } catch (err) {
    if (err.code !== "P2025") throw err;
  }
  return NextResponse.json({ ok: true });
}
