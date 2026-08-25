import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { uniqueSlug } from "@/lib/slugify";

const VALID_SCOPES = ["interno", "nazionale", "privato"];

export const GET = withAuth(async () => {
  const apps = await prisma.application.findMany({
    include: {
      domain: true,
      contracts: { include: { vendor: true } },
      modules: { orderBy: { createdAt: "asc" } },
      requirements: { include: { sharedWith: true, module: true } },
    },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(apps);
});

export const POST = withAuth(async (req) => {
  const body = await req.json();
  const scope = body.scope || "interno";
  if (!VALID_SCOPES.includes(scope))
    return NextResponse.json({ error: "scope non valido" }, { status: 400 });

  if (scope === "nazionale" && body.contractIds?.length)
    return NextResponse.json({ error: "Un applicativo nazionale non può avere contratti" }, { status: 400 });

  const slug = body.slug
    ? body.slug
    : await uniqueSlug(body.name, prisma.application);

  const app = await prisma.application.create({
    data: {
      name: body.name,
      slug,
      scope,
      domainId: body.domainId,
      contracts: scope !== "nazionale" ? { connect: (body.contractIds || []).map((id) => ({ id })) } : undefined,
    },
    include: { domain: true, contracts: { include: { vendor: true } }, modules: true, requirements: true },
  });
  return NextResponse.json(app);
});
