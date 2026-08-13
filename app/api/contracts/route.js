import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const contracts = await prisma.contract.findMany({ include: { vendor: true }, orderBy: { createdAt: "asc" } });
  return NextResponse.json(contracts);
}

export async function POST(req) {
  const body = await req.json();
  const contract = await prisma.contract.create({
    data: {
      name: body.name,
      vendorId: body.vendorId,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      cig: body.cig || [],
      cup: body.cup || [],
    },
    include: { vendor: true },
  });
  return NextResponse.json(contract);
}
