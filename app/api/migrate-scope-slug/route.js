import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function toSlug(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const SCOPE_MAP = [
  ["firma namirial", "privato"],
  ["firma aruba", "privato"],
  ["pec aruba", "privato"],
  ["p.a.r.e.r.", "nazionale"],
  ["parer", "nazionale"],
];

function getScope(name) {
  const lower = name.toLowerCase().trim();
  for (const [pattern, scope] of SCOPE_MAP) {
    if (lower.includes(pattern)) return scope;
  }
  return "interno";
}

export async function POST() {
  const apps = await prisma.application.findMany();
  const modules = await prisma.module.findMany();

  const appSlugs = new Set();
  const moduleSlugs = new Set();
  const results = [];

  for (const app of apps) {
    let slug = toSlug(app.name);
    let counter = 2;
    while (appSlugs.has(slug)) slug = `${toSlug(app.name)}-${counter++}`;
    appSlugs.add(slug);

    const scope = getScope(app.name);
    await prisma.application.update({
      where: { id: app.id },
      data: { slug, scope },
    });
    results.push({ type: "app", name: app.name, slug, scope });
  }

  for (const mod of modules) {
    let slug = toSlug(mod.name);
    let counter = 2;
    while (moduleSlugs.has(slug)) slug = `${toSlug(mod.name)}-${counter++}`;
    moduleSlugs.add(slug);

    await prisma.module.update({
      where: { id: mod.id },
      data: { slug },
    });
    results.push({ type: "module", name: mod.name, slug });
  }

  return NextResponse.json({ populated: results.length, results });
}
