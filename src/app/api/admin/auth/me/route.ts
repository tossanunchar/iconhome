import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET() {
  const payload = await getCurrentAdmin();
  if (!payload) return NextResponse.json({ admin: null });

  const admin = await prisma.admin.findUnique({
    where: { id: payload.adminId },
    select: { id: true, username: true },
  });
  return NextResponse.json({ admin });
}
