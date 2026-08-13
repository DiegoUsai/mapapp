import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Importa un dataset completo (proveniente da JSON o da un file Excel già convertito lato client
// con lo stesso schema). Ogni elemento con lo stesso "id" sovrascrive quello esistente (upsert),
// gli elementi nuovi vengono aggiunti. L'ordine rispetta le dipendenze tra le entità.
export async function POST(req) {
  const body = await req.json();
  const { domains = [], vendors = [], integrationTypes = [], contracts = [], apps = [], integrations = [] } = body;

  await prisma.$transaction(async (tx) => {
    for (const d of domains) {
      const data = { name: d.name, color: d.color, type: d.type || "verticale", cofogCode: d.cofogCode || null, eurovocUri: d.eurovocUri || null };
      await tx.domain.upsert({ where: { id: d.id }, update: data, create: { id: d.id, ...data } });
    }
    for (const v of vendors) {
      await tx.vendor.upsert({ where: { id: v.id }, update: { name: v.name }, create: { id: v.id, name: v.name } });
    }
    for (const t of integrationTypes) {
      await tx.integrationType.upsert({ where: { id: t.id }, update: { name: t.name, color: t.color }, create: { id: t.id, name: t.name, color: t.color } });
    }
    for (const c of contracts) {
      const data = {
        name: c.name, vendorId: c.vendorId,
        startDate: c.startDate ? new Date(c.startDate) : null, endDate: c.endDate ? new Date(c.endDate) : null,
        cig: c.cig || [], cup: c.cup || [],
      };
      await tx.contract.upsert({ where: { id: c.id }, update: data, create: { id: c.id, ...data } });
    }
    for (const a of apps) {
      const contractIds = a.contractIds || (a.contractId ? [a.contractId] : []);
      await tx.application.upsert({
        where: { id: a.id },
        update: { name: a.name, domainId: a.domainId, contracts: { set: contractIds.map((id) => ({ id })) } },
        create: { id: a.id, name: a.name, domainId: a.domainId, contracts: { connect: contractIds.map((id) => ({ id })) } },
      });
    }
    // prima passata: crea/aggiorna i requisiti senza i collegamenti condivisi
    for (const a of apps) {
      for (const r of a.requirements || []) {
        await tx.requirement.upsert({
          where: { id: r.id },
          update: { name: r.name, status: r.status, externalId: r.externalId || null, externalSystem: r.externalSystem || null, applicationId: a.id },
          create: { id: r.id, name: r.name, status: r.status, externalId: r.externalId || null, externalSystem: r.externalSystem || null, applicationId: a.id },
        });
      }
    }
    // seconda passata: collega i requisiti condivisi (relazione simmetrica)
    for (const a of apps) {
      for (const r of a.requirements || []) {
        if (r.sharedWith?.length) {
          await tx.requirement.update({
            where: { id: r.id },
            data: { sharedWith: { connect: r.sharedWith.map((id) => ({ id })) } },
          });
        }
      }
    }
    for (const i of integrations) {
      const data = { fromId: i.fromId, toId: i.toId, typeId: i.typeId, label: i.label, status: i.status || "backlog" };
      await tx.integration.upsert({ where: { id: i.id }, update: data, create: { id: i.id, ...data } });
    }
  });

  return NextResponse.json({ ok: true });
}
