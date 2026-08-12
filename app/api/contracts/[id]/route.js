import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req, { params }) {
  const { id } = await params;
  const body = await req.json();
  const data = { ...body };
  if ("startDate" in data) data.startDate = data.startDate ? new Date(data.startDate) : null;
  if ("endDate" in data) data.endDate = data.endDate ? new Date(data.endDate) : null;
  const contract = await prisma.contract.update({ where: { id }, data, include: { vendor: true } });
  return NextResponse.json(contract);
}

export async function DELETE(_req, { params }) {
  const { id } = await params;
  try {
    await prisma.contract.delete({ where: { id } });
  } catch (err) {
    if (err.code !== "P2025") throw err;
  }
  return NextResponse.json({ ok: true });
}
