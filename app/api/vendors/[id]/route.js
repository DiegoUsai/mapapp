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
  const count = await prisma.contract.count({ where: { vendorId: id } });
  if (count > 0) {
    return NextResponse.json({ error: "Fornitore in uso da contratti collegati", count }, { status: 409 });
  }
  try {
    await prisma.vendor.delete({ where: { id } });
  } catch (err) {
    if (err.code !== "P2025") throw err;
  }
  return NextResponse.json({ ok: true });
}
