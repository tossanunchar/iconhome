import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { validateBody } from "@/lib/validate";
import { bannerSchema } from "@/lib/schemas";

async function requireAdmin() {
  const session = await getCurrentAdmin();
  return !!session?.adminId;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 });
  }

  const { id } = await params;
  const bannerId = parseInt(id);
  if (!Number.isFinite(bannerId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  // ใช้ schema เดียวกับ create (.partial() เพื่อรองรับ partial update)
  const parsed = await validateBody(req, bannerSchema.partial());
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  const banner = await prisma.banner.update({
    where: { id: bannerId },
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
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 });
  }

  const { id } = await params;
  const bannerId = parseInt(id);
  if (!Number.isFinite(bannerId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  await prisma.banner.delete({ where: { id: bannerId } });
  return NextResponse.json({ ok: true });
}
