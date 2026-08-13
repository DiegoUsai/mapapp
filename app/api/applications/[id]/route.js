import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req, { params }) {
  const { id } = await params;
  const { contractIds, ...rest } = await req.json();
  const data = { ...rest };
  if (contractIds) data.contracts = { set: contractIds.map((cid) => ({ id: cid })) };
  const app = await prisma.application.update({
    where: { id },
    data,
    include: { domain: true, contracts: { include: { vendor: true } }, requirements: true },
  });
  return NextResponse.json(app);
}

export async function DELETE(_req, { params }) {
  const { id } = await params;
  try {
    await prisma.application.delete({ where: { id } });
  } catch (err) {
    if (err.code !== "P2025") throw err;
  }
  return NextResponse.json({ ok: true });
}
