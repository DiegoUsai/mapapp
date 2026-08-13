import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req, { params }) {
  const { id } = await params;
  const body = await req.json();
  const module_ = await prisma.module.update({ where: { id }, data: { name: body.name } });
  return NextResponse.json(module_);
}

// Un modulo esiste solo come parte di un applicativo (proprietà stretta), ma i requisiti e le
// integrazioni che vi sono assegnati appartengono comunque, prima di tutto, all'applicativo:
// alla cancellazione del modulo tornano al livello di default invece di essere cancellati.
export async function DELETE(_req, { params }) {
  const { id } = await params;
  try {
    await prisma.$transaction([
      prisma.requirement.updateMany({ where: { moduleId: id }, data: { moduleId: null } }),
      prisma.integration.updateMany({ where: { fromModuleId: id }, data: { fromModuleId: null } }),
      prisma.integration.updateMany({ where: { toModuleId: id }, data: { toModuleId: null } }),
      prisma.module.delete({ where: { id } }),
    ]);
  } catch (err) {
    if (err.code !== "P2025") throw err;
  }
  return NextResponse.json({ ok: true });
}
