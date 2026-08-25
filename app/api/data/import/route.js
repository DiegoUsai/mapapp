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
      const data = { name: d.name, color: d.color, ambito: d.ambito || d.type || "verticale", core: d.core || false, cofogCode: d.cofogCode || null };
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
      const appData = { name: a.name, domainId: a.domainId, scope: a.scope || "interno", slug: a.slug || null };
      await tx.application.upsert({
        where: { id: a.id },
        update: { ...appData, contracts: { set: contractIds.map((id) => ({ id })) } },
        create: { id: a.id, ...appData, contracts: { connect: contractIds.map((id) => ({ id })) } },
      });
    }
    for (const a of apps) {
      for (const m of a.modules || []) {
        const modData = { name: m.name, description: m.description || null, slug: m.slug || null };
        await tx.module.upsert({
          where: { id: m.id },
          update: modData,
          create: { id: m.id, ...modData, applicationId: a.id },
        });
      }
    }
    // prima passata: crea/aggiorna i requisiti senza i collegamenti condivisi
    for (const a of apps) {
      for (const r of a.requirements || []) {
        const data = {
          name: r.name, status: r.status,
          externalId: r.externalId || null, externalSystem: r.externalSystem || null,
          applicationId: a.id, moduleId: r.moduleId || null,
        };
        await tx.requirement.upsert({ where: { id: r.id }, update: data, create: { id: r.id, ...data } });
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
      const data = {
        fromId: i.fromId, toId: i.toId, typeId: i.typeId, label: i.label, status: i.status || "backlog",
        fromModuleId: i.fromModuleId || null, toModuleId: i.toModuleId || null,
      };
      await tx.integration.upsert({ where: { id: i.id }, update: data, create: { id: i.id, ...data } });
    }
  });

  return NextResponse.json({ ok: true });
}
