import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

// Admin-only one-shot endpoint: ใส่ badge ให้สินค้า
// - NEW: 100 รายการล่าสุด
// - HOT: 30 สินค้าราคาแพงสุดที่ยังไม่มี badge
// - SALE: สินค้าที่ originalPrice > price (ถ้ามี)
//
// เรียกใช้: POST /api/admin/utils/assign-badges (ต้อง login admin)

export async function POST() {
  const session = await getCurrentAdmin();
  if (!session?.adminId) {
    return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 });
  }

  // ---- 1. ลบ badge เก่าทั้งหมดก่อน เพื่อ idempotent ----
  const cleared = await prisma.product.updateMany({
    where: { badge: { not: null } },
    data: { badge: null },
  });

  // ---- 2. NEW badge: สินค้า 100 รายการล่าสุด ----
  const newest = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true },
  });
  const newResult = await prisma.product.updateMany({
    where: { id: { in: newest.map((p) => p.id) } },
    data: { badge: "NEW" },
  });

  // ---- 3. SALE badge: สินค้าที่ originalPrice > price ----
  let saleCount = 0;
  try {
    const saleCandidates = await prisma.$queryRaw<Array<{ id: number }>>`
      SELECT id FROM "Product"
      WHERE "originalPrice" IS NOT NULL
        AND "originalPrice" > price
      ORDER BY ("originalPrice" - price) DESC
      LIMIT 200
    `;
    if (saleCandidates.length > 0) {
      const saleResult = await prisma.product.updateMany({
        where: { id: { in: saleCandidates.map((p) => p.id) } },
        data: { badge: "SALE" },
      });
      saleCount = saleResult.count;
    }
  } catch (e) {
    console.error("SALE assignment failed:", e);
  }

  // ---- 4. HOT badge: สินค้าราคาแพงสุด 30 รายการที่ยังไม่มี badge ----
  const expensive = await prisma.product.findMany({
    where: { price: { gt: 0 }, badge: null },
    orderBy: { price: "desc" },
    take: 30,
    select: { id: true },
  });
  const hotResult = await prisma.product.updateMany({
    where: { id: { in: expensive.map((p) => p.id) } },
    data: { badge: "HOT" },
  });

  // ---- สรุป ----
  const summary = await prisma.product.groupBy({
    by: ["badge"],
    _count: true,
  });

  return NextResponse.json({
    ok: true,
    cleared: cleared.count,
    assigned: {
      NEW: newResult.count,
      SALE: saleCount,
      HOT: hotResult.count,
    },
    summary: summary.map((s) => ({ badge: s.badge ?? "(ไม่มี)", count: s._count })),
  });
}
