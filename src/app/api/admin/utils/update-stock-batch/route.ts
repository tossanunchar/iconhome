import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

// Admin-only: bulk update stock โดย match จาก slug
// POST { updates: [{ slug: string, stock: number }, ...] }   max 1000 ต่อ batch

export async function POST(req: NextRequest) {
  const session = await getCurrentAdmin();
  if (!session?.adminId) {
    return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 });
  }

  let body: { updates?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "ข้อมูลไม่ใช่ JSON" }, { status: 400 });
  }

  if (!Array.isArray(body.updates)) {
    return NextResponse.json({ error: "updates ต้องเป็น array" }, { status: 400 });
  }

  const updates = (body.updates as Array<{ slug?: unknown; stock?: unknown }>)
    .map((u) => ({
      slug: typeof u.slug === "string" ? u.slug : "",
      stock: typeof u.stock === "number" ? u.stock : parseInt(String(u.stock)),
    }))
    .filter((u) => u.slug && Number.isFinite(u.stock) && u.stock >= 0 && u.stock <= 999999);

  if (updates.length === 0) {
    return NextResponse.json({ error: "ไม่มี update ที่ valid" }, { status: 400 });
  }
  if (updates.length > 1000) {
    return NextResponse.json({ error: `เกิน 1000 ต่อ batch (${updates.length})` }, { status: 400 });
  }

  // ---- run in transaction ----
  const slugs = updates.map((u) => u.slug);
  const existing = await prisma.product.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true },
  });
  const slugToId = new Map(existing.map((p) => [p.slug, p.id]));

  const toUpdate = updates.filter((u) => slugToId.has(u.slug));
  const notFound = updates.filter((u) => !slugToId.has(u.slug)).map((u) => u.slug);

  await prisma.$transaction(
    toUpdate.map((u) =>
      prisma.product.update({
        where: { id: slugToId.get(u.slug)! },
        data: { stock: u.stock },
      })
    )
  );

  return NextResponse.json({
    ok: true,
    requested: updates.length,
    updated: toUpdate.length,
    notFound: notFound.length,
    notFoundSlugs: notFound.slice(0, 10), // first 10 for debugging
  });
}
