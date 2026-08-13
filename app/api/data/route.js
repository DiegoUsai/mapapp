import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";

export const GET = withAuth(async () => {
  const [domains, vendors, contracts, integrationTypes, integrations, applications] = await Promise.all([
    prisma.domain.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.vendor.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.contract.findMany({ include: { vendor: true }, orderBy: { createdAt: "asc" } }),
    prisma.integrationType.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.integration.findMany({ include: { type: true, fromModule: true, toModule: true } }),
    prisma.application.findMany({
      include: {
        domain: true,
        contracts: { include: { vendor: true } },
        modules: { orderBy: { createdAt: "asc" } },
        requirements: { include: { sharedWith: true, module: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return NextResponse.json({ domains, vendors, contracts, integrationTypes, integrations, applications });
});
