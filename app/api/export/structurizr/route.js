import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toSlug } from "@/lib/slugify";

function dslId(entity) {
  const slug = entity.slug || toSlug(entity.name);
  return slug.replace(/-/g, "_");
}

function q(s) {
  return `"${(s || "").replace(/"/g, "'")}"`;
}

function indent(lines, level = 1) {
  const pad = "    ".repeat(level);
  return lines.map((l) => pad + l).join("\n");
}

async function loadData(scopeFilter) {
  const where = scopeFilter ? { scope: scopeFilter } : {};
  const apps = await prisma.application.findMany({
    where,
    include: { domain: true, contracts: { include: { vendor: true } }, modules: true },
  });
  const integrations = await prisma.integration.findMany({
    include: { type: true },
  });
  const appIds = new Set(apps.map((a) => a.id));
  const filteredIntegrations = integrations.filter(
    (i) => appIds.has(i.fromId) && appIds.has(i.toId)
  );
  return { apps, integrations: filteredIntegrations };
}

function buildLandscape(apps, integrations) {
  const lines = [];
  lines.push(`workspace "Mappa Applicativa" "Mappa applicativa multi-fornitore" {`);
  lines.push("");
  lines.push("    !identifiers hierarchical");
  lines.push("");
  lines.push("    model {");

  for (const a of apps) {
    const id = dslId(a);
    const scope = a.scope || "interno";
    const sysLines = [];
    sysLines.push(`${id} = softwareSystem ${q(a.name)} ${q(a.domain?.name || "")} "${scope}" {`);
    sysLines.push(`    tags "${scope}"`);
    sysLines.push(`    properties {`);
    sysLines.push(`        "scope" "${scope}"`);
    if (a.slug) sysLines.push(`        "slug" "${a.slug}"`);
    if (a.domain?.name) sysLines.push(`        "dominio" ${q(a.domain.name)}`);
    sysLines.push(`    }`);
    for (const m of a.modules || []) {
      sysLines.push(`    ${dslId(m)} = container ${q(m.name)} ${q(m.description || "")} "" {`);
      if (m.slug) sysLines.push(`        properties { "slug" "${m.slug}" }`);
      sysLines.push(`    }`);
    }
    sysLines.push("}");
    lines.push(indent(sysLines, 2));
    lines.push("");
  }

  const appsById = Object.fromEntries(apps.map((a) => [a.id, a]));
  for (const i of integrations) {
    const from = appsById[i.fromId];
    const to = appsById[i.toId];
    if (!from || !to) continue;
    const tech = i.type?.name || "";
    lines.push(indent([`${dslId(from)} -> ${dslId(to)} ${q(i.label || "")} ${q(tech)} "integrazione"`], 2));
  }

  lines.push("    }");
  lines.push("");
  lines.push("    views {");
  lines.push(`        systemLandscape "landscape" "Vista d'insieme" {`);
  lines.push("            include *");
  lines.push("            autoLayout tb");
  lines.push("        }");
  lines.push("");

  lines.push(buildStyles());
  lines.push("    }");
  lines.push("}");
  return lines.join("\n");
}

function buildContext(apps, integrations, appId) {
  const target = apps.find((a) => a.id === appId);
  if (!target) return null;

  const connectedIds = new Set();
  connectedIds.add(appId);
  integrations.forEach((i) => {
    if (i.fromId === appId) connectedIds.add(i.toId);
    if (i.toId === appId) connectedIds.add(i.fromId);
  });

  const contextApps = apps.filter((a) => connectedIds.has(a.id));
  const contextIntegrations = integrations.filter(
    (i) => connectedIds.has(i.fromId) && connectedIds.has(i.toId)
  );

  const lines = [];
  lines.push(`workspace "Contesto: ${target.name}" "" {`);
  lines.push("");
  lines.push("    !identifiers hierarchical");
  lines.push("");
  lines.push("    model {");

  const appsById = {};
  for (const a of contextApps) {
    appsById[a.id] = a;
    const id = dslId(a);
    const scope = a.scope || "interno";
    lines.push(indent([`${id} = softwareSystem ${q(a.name)} ${q(a.domain?.name || "")} "${scope}" {`], 2));
    lines.push(indent([`    tags "${scope}"`], 2));
    lines.push(indent([`}`], 2));
    lines.push("");
  }

  for (const i of contextIntegrations) {
    const from = appsById[i.fromId];
    const to = appsById[i.toId];
    if (!from || !to) continue;
    lines.push(indent([`${dslId(from)} -> ${dslId(to)} ${q(i.label || "")} ${q(i.type?.name || "")} "integrazione"`], 2));
  }

  lines.push("    }");
  lines.push("");
  lines.push("    views {");
  lines.push(`        systemContext ${dslId(target)} "context-${dslId(target)}" "Contesto di ${target.name}" {`);
  lines.push("            include *");
  lines.push("            autoLayout tb");
  lines.push("        }");
  lines.push("");
  lines.push(buildStyles());
  lines.push("    }");
  lines.push("}");
  return lines.join("\n");
}

function buildContainer(apps, integrations, appId) {
  const target = apps.find((a) => a.id === appId);
  if (!target || !target.modules?.length) return null;

  const lines = [];
  lines.push(`workspace "Container: ${target.name}" "" {`);
  lines.push("");
  lines.push("    !identifiers hierarchical");
  lines.push("");
  lines.push("    model {");

  const id = dslId(target);
  const scope = target.scope || "interno";
  lines.push(indent([`${id} = softwareSystem ${q(target.name)} ${q(target.domain?.name || "")} "${scope}" {`], 2));
  lines.push(indent([`    tags "${scope}"`], 2));
  for (const m of target.modules) {
    lines.push(indent([`    ${dslId(m)} = container ${q(m.name)} ${q(m.description || "")} ""`], 2));
  }

  const moduleIntegrations = integrations.filter(
    (i) => i.fromModuleId && i.toModuleId &&
      target.modules.some((m) => m.id === i.fromModuleId || m.id === i.toModuleId)
  );
  for (const i of moduleIntegrations) {
    const fromMod = target.modules.find((m) => m.id === i.fromModuleId);
    const toMod = target.modules.find((m) => m.id === i.toModuleId);
    if (fromMod && toMod) {
      lines.push(indent([`    ${dslId(fromMod)} -> ${dslId(toMod)} ${q(i.label || "")} ${q(i.type?.name || "")}`], 2));
    }
  }
  lines.push(indent([`}`], 2));

  const connectedIds = new Set();
  integrations.forEach((i) => {
    if (i.fromId === appId && i.toId !== appId) connectedIds.add(i.toId);
    if (i.toId === appId && i.fromId !== appId) connectedIds.add(i.fromId);
  });
  const externalApps = apps.filter((a) => connectedIds.has(a.id));
  for (const a of externalApps) {
    const extScope = a.scope || "interno";
    lines.push(indent([`${dslId(a)} = softwareSystem ${q(a.name)} "" "${extScope}" {`], 2));
    lines.push(indent([`    tags "${extScope}"`], 2));
    lines.push(indent([`}`], 2));
  }

  const externalIntegrations = integrations.filter(
    (i) => (i.fromId === appId || i.toId === appId) && i.fromId !== i.toId
  );
  const appsById = Object.fromEntries([target, ...externalApps].map((a) => [a.id, a]));
  for (const i of externalIntegrations) {
    const from = appsById[i.fromId];
    const to = appsById[i.toId];
    if (!from || !to) continue;
    lines.push(indent([`${dslId(from)} -> ${dslId(to)} ${q(i.label || "")} ${q(i.type?.name || "")} "integrazione"`], 2));
  }

  lines.push("    }");
  lines.push("");
  lines.push("    views {");
  lines.push(`        container ${id} "containers-${id}" "Container di ${target.name}" {`);
  lines.push("            include *");
  lines.push("            autoLayout tb");
  lines.push("        }");
  lines.push("");
  lines.push(buildStyles());
  lines.push("    }");
  lines.push("}");
  return lines.join("\n");
}

function buildStyles() {
  return [
    "        styles {",
    '            element "Software System" { shape RoundedBox background #1168bd color #ffffff }',
    '            element "interno" { background #3E5C76 color #ffffff border solid }',
    '            element "nazionale" { background #2F7D5C color #ffffff border solid }',
    '            element "privato" { background #C97F1E color #ffffff border dashed }',
    '            element "Container" { shape RoundedBox background #85bbf0 color #000000 }',
    '            relationship "Relationship" { thickness 2 color #707070 style solid routing Direct }',
    '            relationship "integrazione" { style dashed color #d46a6a thickness 2 }',
    "        }",
  ].join("\n");
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const level = searchParams.get("level") || "landscape";
  const appId = searchParams.get("appId");
  const scopeFilter = searchParams.get("scope") || null;

  const { apps, integrations } = await loadData(level === "landscape" ? scopeFilter : null);

  let dsl;
  if (level === "context") {
    if (!appId) return NextResponse.json({ error: "appId required" }, { status: 400 });
    dsl = buildContext(apps, integrations, appId);
    if (!dsl) return NextResponse.json({ error: "app not found" }, { status: 404 });
  } else if (level === "container") {
    if (!appId) return NextResponse.json({ error: "appId required" }, { status: 400 });
    const allApps = await prisma.application.findMany({
      include: { domain: true, contracts: { include: { vendor: true } }, modules: true },
    });
    const allIntegrations = await prisma.integration.findMany({ include: { type: true } });
    dsl = buildContainer(allApps, allIntegrations, appId);
    if (!dsl) return NextResponse.json({ error: "app not found or has no modules" }, { status: 404 });
  } else {
    dsl = buildLandscape(apps, integrations);
  }

  return new NextResponse(dsl, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename=workspace.dsl`,
    },
  });
}
