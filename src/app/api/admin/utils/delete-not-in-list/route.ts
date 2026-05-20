import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

// Admin-only: ลบสินค้าทั้งหมดที่ slug ไม่อยู่ใน "keepSlugs" list
//
// POST { keepSlugs: string[], confirm?: boolean }
//   Preview (confirm=false): ส่ง count + sample ของสินค้าที่จะถูกลบ
//   Confirm (confirm=true): ลบจริง

export async function POST(req: NextRequest) {
  const session = await getCurrentAdmin();
  if (!session?.adminId) {
    return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 });
  }

  let body: { keepSlugs?: unknown; confirm?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "ข้อมูลไม่ใช่ JSON" }, { status: 400 });
  }

  if (!Array.isArray(body.keepSlugs)) {
    return NextResponse.json({ error: "keepSlugs ต้องเป็น array" }, { status: 400 });
  }
  const keepSlugs = (body.keepSlugs as unknown[])
    .map((s) => String(s))
    .filter((s) => s.length > 0);

  if (keepSlugs.length === 0) {
    return NextResponse.json({ error: "keepSlugs ว่าง — จะลบทุกอย่าง? ปฏิเสธ" }, { status: 400 });
  }

  const confirm = body.confirm === true;

  // ---- หาว่ามีกี่สินค้าที่จะถูกลบ ----
  const toDelete = await prisma.product.findMany({
    where: { NOT: { slug: { in: keepSlugs } } },
    select: { id: true, slug: true, name: true },
  });

  if (toDelete.length === 0) {
    return NextResponse.json({
      mode: confirm ? "delete" : "preview",
      count: 0,
      message: "ไม่มีสินค้าที่ต้องลบ — ทุกตัวอยู่ใน keepSlugs",
    });
  }

  if (!confirm) {
    return NextResponse.json({
      mode: "preview",
      count: toDelete.length,
      keepSlugs: keepSlugs.length,
      sample: toDelete.slice(0, 10).map((p) => ({ id: p.id, slug: p.slug, name: p.name })),
      message: `จะลบ ${toDelete.length.toLocaleString()} รายการ — ส่ง confirm:true เพื่อยืนยัน`,
    });
  }

  // ---- safety: max 10000 ต่อครั้ง ----
  if (toDelete.length > 10000) {
    return NextResponse.json({
      error: `จะลบ ${toDelete.length} เกิน 10,000 ต่อครั้ง — จำกัดด้วย safety guard`,
    }, { status: 400 });
  }

  // ---- run in transaction ----
  const ids = toDelete.map((p) => p.id);
  const result = await prisma.$transaction(async (tx) => {
    const orphaned = await tx.orderItem.updateMany({
      where: { productId: { in: ids } },
      data: { productId: null },
    });
    const deleted = await tx.product.deleteMany({
      where: { id: { in: ids } },
    });
    return { deleted: deleted.count, orphanedOrderItems: orphaned.count };
  });

  // ---- final count ----
  const totalRemaining = await prisma.product.count();

  return NextResponse.json({
    mode: "delete",
    requested: toDelete.length,
    deleted: result.deleted,
    orphanedOrderItems: result.orphanedOrderItems,
    totalRemaining,
    message: `ลบ ${result.deleted.toLocaleString()} สำเร็จ เหลือ ${totalRemaining.toLocaleString()} รายการ`,
  });
}
