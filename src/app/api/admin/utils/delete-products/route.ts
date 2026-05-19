import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

// Admin-only utility: ค้นหา/ลบสินค้าตามคำในชื่อหรือคำอธิบาย
//
// Preview mode (default):
//   POST { keyword: "แถม" } → ส่งจำนวน + sample 10 รายการ
//
// Delete mode:
//   POST { keyword: "แถม", confirm: true }
//     → ลบ orderItems ที่อ้างถึง (set productId=null) แล้วลบ product
//
// Search scope: name OR description (case-insensitive)

export async function POST(req: NextRequest) {
  const session = await getCurrentAdmin();
  if (!session?.adminId) {
    return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 });
  }

  let body: { keyword?: unknown; scope?: unknown; confirm?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "ข้อมูลไม่ใช่ JSON" }, { status: 400 });
  }

  const keyword = typeof body.keyword === "string" ? body.keyword.trim() : "";
  if (!keyword || keyword.length < 2) {
    return NextResponse.json({ error: "keyword ต้องยาวอย่างน้อย 2 ตัวอักษร" }, { status: 400 });
  }
  if (keyword.length > 100) {
    return NextResponse.json({ error: "keyword ยาวเกินไป" }, { status: 400 });
  }

  const scope = body.scope === "description" ? "description" : (body.scope === "both" ? "both" : "name");
  const confirm = body.confirm === true;

  // ---- สร้าง where clause ----
  const where = (() => {
    if (scope === "name") {
      return { name: { contains: keyword } };
    }
    if (scope === "description") {
      return { description: { contains: keyword } };
    }
    // both
    return {
      OR: [
        { name: { contains: keyword } },
        { description: { contains: keyword } },
      ],
    };
  })();

  // ---- count + sample (preview) ----
  if (!confirm) {
    const [count, sample] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        select: { id: true, name: true, description: true, price: true, brand: true },
        take: 10,
        orderBy: { id: "asc" },
      }),
    ]);
    return NextResponse.json({
      mode: "preview",
      keyword,
      scope,
      count,
      sample,
      message: count === 0
        ? "ไม่พบสินค้าที่ตรงเงื่อนไข"
        : `พบสินค้า ${count.toLocaleString()} รายการที่จะถูกลบ ส่ง confirm:true เพื่อยืนยัน`,
    });
  }

  // ---- delete mode ----
  // หา product ids ก่อน เพื่อใช้ update orderItems
  const products = await prisma.product.findMany({
    where,
    select: { id: true },
  });
  const ids = products.map((p) => p.id);

  if (ids.length === 0) {
    return NextResponse.json({ mode: "delete", deleted: 0, message: "ไม่พบสินค้าที่ตรงเงื่อนไข" });
  }

  // ---- ปกป้อง: ห้ามลบเกิน 1000 ใน 1 ครั้ง ----
  if (ids.length > 1000) {
    return NextResponse.json({
      error: `จำนวนสินค้า ${ids.length.toLocaleString()} เกินขีดจำกัด 1,000 ต่อครั้ง — แบ่งลบเป็นรอบหรือใช้ keyword ที่เจาะจงกว่านี้`,
    }, { status: 400 });
  }

  // ---- ทำในธุรกรรมเดียว ----
  const result = await prisma.$transaction(async (tx) => {
    // 1) set productId=null ใน orderItems ที่อ้างถึง (กัน FK constraint)
    const orphaned = await tx.orderItem.updateMany({
      where: { productId: { in: ids } },
      data: { productId: null },
    });

    // 2) ลบ product
    const deleted = await tx.product.deleteMany({
      where: { id: { in: ids } },
    });

    return { deleted: deleted.count, orphanedOrderItems: orphaned.count };
  });

  return NextResponse.json({
    mode: "delete",
    keyword,
    scope,
    deleted: result.deleted,
    orphanedOrderItems: result.orphanedOrderItems,
    message: `ลบสินค้า ${result.deleted.toLocaleString()} รายการสำเร็จ (orphan order items: ${result.orphanedOrderItems})`,
  });
}
