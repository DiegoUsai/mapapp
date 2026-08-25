import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_SCOPES = ["interno", "nazionale", "privato"];

export async function PATCH(req, { params }) {
  const { id } = await params;
  const { contractIds, slug, ...rest } = await req.json();

  if (rest.scope && !VALID_SCOPES.includes(rest.scope))
    return NextResponse.json({ error: "scope non valido" }, { status: 400 });

  const data = { ...rest };
  delete data.slug;

  if (rest.scope === "nazionale") {
    data.contracts = { set: [] };
  } else if (contractIds) {
    data.contracts = { set: contractIds.map((cid) => ({ id: cid })) };
  }

  const app = await prisma.application.update({
    where: { id },
    data,
    include: { domain: true, contracts: { include: { vendor: true } }, modules: true, requirements: true },
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
