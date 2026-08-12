import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [domains, vendors, contracts, integrationTypes, integrations, applications] = await Promise.all([
    prisma.domain.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.vendor.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.contract.findMany({ include: { vendor: true }, orderBy: { createdAt: "asc" } }),
    prisma.integrationType.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.integration.findMany({ include: { type: true } }),
    prisma.application.findMany({
      include: {
        domain: true,
        contract: { include: { vendor: true } },
        requirements: { include: { sharedWith: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return NextResponse.json({ domains, vendors, contracts, integrationTypes, integrations, applications });
}
