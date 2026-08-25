import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toSlug } from "@/lib/slugify";
import * as yaml from "js-yaml";
import JSZip from "jszip";

const NS = "regione-sardegna";

function slugFor(entity) {
  return entity.slug || toSlug(entity.name);
}

function buildDomains(domains) {
  return domains.map((d) => ({
    apiVersion: "backstage.io/v1alpha1",
    kind: "Domain",
    metadata: {
      name: toSlug(d.name),
      namespace: NS,
      title: d.name,
      annotations: {
        "mapapp/ambito": d.ambito || "verticale",
        ...(d.core ? { "mapapp/core": "true" } : {}),
        ...(d.cofogCode ? { "mapapp/cofog": d.cofogCode } : {}),
      },
    },
    spec: { owner: `group:${NS}/regione-sardegna` },
  }));
}

function buildSystems(apps) {
  return apps.map((a) => ({
    apiVersion: "backstage.io/v1alpha1",
    kind: "System",
    metadata: {
      name: slugFor(a),
      namespace: NS,
      title: a.name,
    },
    spec: {
      owner: a.contracts?.[0]?.vendor
        ? `group:${NS}/${toSlug(a.contracts[0].vendor.name)}`
        : `group:${NS}/regione-sardegna`,
      domain: `domain:${NS}/${toSlug(a.domain.name)}`,
    },
  }));
}

function buildComponents(apps) {
  const components = [];
  for (const a of apps) {
    for (const m of a.modules || []) {
      components.push({
        apiVersion: "backstage.io/v1alpha1",
        kind: "Component",
        metadata: {
          name: slugFor(m),
          namespace: NS,
          title: m.name,
          ...(m.description ? { description: m.description } : {}),
        },
        spec: {
          type: "service",
          lifecycle: "production",
          owner: a.contracts?.[0]?.vendor
            ? `group:${NS}/${toSlug(a.contracts[0].vendor.name)}`
            : `group:${NS}/regione-sardegna`,
          system: `system:${NS}/${slugFor(a)}`,
        },
      });
    }
  }
  return components;
}

function buildGroups(vendors) {
  return vendors.map((v) => ({
    apiVersion: "backstage.io/v1alpha1",
    kind: "Group",
    metadata: {
      name: toSlug(v.name),
      namespace: NS,
      title: v.name,
    },
    spec: { type: "vendor", children: [] },
  }));
}

function buildAPIs(integrations, appsById) {
  return integrations.map((i) => ({
    apiVersion: "backstage.io/v1alpha1",
    kind: "API",
    metadata: {
      name: `integration-${toSlug(i.label || i.id)}`,
      namespace: NS,
      title: i.label || `${appsById[i.fromId]?.name} → ${appsById[i.toId]?.name}`,
      annotations: {
        "mapapp/status": i.status,
        ...(i.type ? { "mapapp/integration-type": i.type.name } : {}),
      },
    },
    spec: {
      type: "openapi",
      lifecycle: i.status === "presente" ? "production" : "experimental",
      owner: `group:${NS}/regione-sardegna`,
      system: `system:${NS}/${slugFor(appsById[i.fromId])}`,
    },
  }));
}

export async function GET() {
  const apps = await prisma.application.findMany({
    where: { scope: "interno" },
    include: { domain: true, contracts: { include: { vendor: true } }, modules: true },
  });
  const appIds = new Set(apps.map((a) => a.id));
  const appsById = Object.fromEntries(apps.map((a) => [a.id, a]));

  const domainIds = [...new Set(apps.map((a) => a.domainId))];
  const domains = await prisma.domain.findMany({ where: { id: { in: domainIds } } });

  const vendorIds = [...new Set(apps.flatMap((a) => a.contracts.map((c) => c.vendorId)).filter(Boolean))];
  const vendors = await prisma.vendor.findMany({ where: { id: { in: vendorIds } } });

  const integrations = await prisma.integration.findMany({
    where: { fromId: { in: [...appIds] }, toId: { in: [...appIds] } },
    include: { type: true },
  });

  const zip = new JSZip();
  const dumpYaml = (docs) => docs.map((d) => yaml.dump(d, { lineWidth: -1 })).join("---\n");

  zip.file("domains.yaml", dumpYaml(buildDomains(domains)));
  zip.file("systems.yaml", dumpYaml(buildSystems(apps)));
  const components = buildComponents(apps);
  if (components.length) zip.file("components.yaml", dumpYaml(components));
  if (vendors.length) zip.file("groups.yaml", dumpYaml(buildGroups(vendors)));
  const apis = buildAPIs(integrations, appsById);
  if (apis.length) zip.file("apis.yaml", dumpYaml(apis));

  const buf = await zip.generateAsync({ type: "nodebuffer" });
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": "attachment; filename=backstage-catalog.zip",
    },
  });
}
