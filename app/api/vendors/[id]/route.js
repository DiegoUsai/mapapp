import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req, { params }) {
  const { id } = await params;
  const body = await req.json();
  const vendor = await prisma.vendor.update({ where: { id }, data: body });
  return NextResponse.json(vendor);
}

export async function DELETE(_req, { params }) {
  const { id } = await params;
  await prisma.vendor.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
