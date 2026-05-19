import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyAdminToken } from "@/lib/auth";
import { cookies } from "next/headers";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return false;
  return !!(await verifyAdminToken(token));
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const banner = await prisma.banner.update({
    where: { id: parseInt(id) },
    data: {
      title: body.title ?? undefined,
      imageUrl: body.imageUrl ?? undefined,
      linkUrl: body.linkUrl ?? undefined,
      position: body.position ?? undefined,
      isActive: body.isActive ?? undefined,
    },
  });
  return NextResponse.json({ banner });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.banner.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ ok: true });
}
