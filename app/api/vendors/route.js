import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const vendors = await prisma.vendor.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(vendors);
}

export async function POST(req) {
  const body = await req.json();
  const vendor = await prisma.vendor.create({ data: { name: body.name } });
  return NextResponse.json(vendor);
}
