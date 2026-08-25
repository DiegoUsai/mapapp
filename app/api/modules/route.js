import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slugify";

export async function POST(req) {
  const body = await req.json();
  const slug = await uniqueSlug(body.name, prisma.module);
  const module_ = await prisma.module.create({
    data: { name: body.name, slug, description: body.description || null, applicationId: body.applicationId },
  });
  return NextResponse.json(module_);
}
