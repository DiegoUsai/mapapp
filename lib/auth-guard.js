import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export function withAuth(handler) {
  return async (req) => {
    const authError = await requireAuth();
    if (authError) return authError;
    return handler(req);
  };
}
