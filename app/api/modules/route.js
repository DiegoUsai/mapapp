import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  const body = await req.json();
  const module_ = await prisma.module.create({
    data: { name: body.name, description: body.description || null, applicationId: body.applicationId },
  });
  return NextResponse.json(module_);
}
