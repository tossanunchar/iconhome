import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

// Admin-only: สุ่ม stock ให้สินค้าตาม price tier
// - ราคาต่ำ → stock มาก (สินค้าที่หมุนเวียนเร็ว)
// - ราคาสูง → stock น้อย (สินค้าที่หมุนเวียนช้า)
//
// Deterministic: ใช้ id เป็น seed → รันซ้ำได้ผลเหมือนเดิม
//
// POST { confirm: true, onlyZero?: boolean }
//   onlyZero: true = update เฉพาะตัวที่ stock = 0 (default), false = update ทุกตัว

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function computeStock(id: number, price: number): number {
  // สูตร: base = round(500 / sqrt(price+1))
  // variance ±50%
  const base = Math.max(1, Math.round(500 / Math.sqrt(price + 1)));
  const rand = mulberry32(id)();
  const variance = 0.5 + rand; // 0.5 - 1.5
  const stock = Math.max(1, Math.round(base * variance));
  // cap ที่ 200 เพื่อกัน outlier
  return Math.min(stock, 200);
}

export async function POST(req: NextRequest) {
  const session = await getCurrentAdmin();
  if (!session?.adminId) {
    return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 });
  }

  let body: { confirm?: unknown; onlyZero?: unknown };
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const confirm = body.confirm === true;
  const onlyZero = body.onlyZero !== false; // default true

  // ดึงสินค้าทั้งหมด (id + price + stock เพื่อ check)
  const products = await prisma.product.findMany({
    where: onlyZero ? { stock: { lte: 0 } } : {},
    select: { id: true, price: true, stock: true },
  });

  if (!confirm) {
    // preview: คำนวณตัวอย่าง + กระจาย stock
    const samples = products.slice(0, 5).map((p) => ({
      id: p.id,
      price: p.price,
      oldStock: p.stock,
      newStock: computeStock(p.id, p.price),
    }));
    // กระจาย stock ตาม bucket
    const buckets = { "1-5": 0, "6-20": 0, "21-50": 0, "51-100": 0, "101-200": 0 };
    products.forEach((p) => {
      const s = computeStock(p.id, p.price);
      if (s <= 5) buckets["1-5"]++;
      else if (s <= 20) buckets["6-20"]++;
      else if (s <= 50) buckets["21-50"]++;
      else if (s <= 100) buckets["51-100"]++;
      else buckets["101-200"]++;
    });
    return NextResponse.json({
      mode: "preview",
      willUpdate: products.length,
      onlyZero,
      samples,
      distribution: buckets,
      message: `จะอัปเดต ${products.length.toLocaleString()} รายการ ส่ง confirm:true เพื่อยืนยัน`,
    });
  }

  // ---- update mode: เป็นแบทช์ละ 1000 (ลด round-trip + tx size) ----
  const BATCH = 500;
  let updated = 0;
  for (let i = 0; i < products.length; i += BATCH) {
    const batch = products.slice(i, i + BATCH);
    await prisma.$transaction(
      batch.map((p) =>
        prisma.product.update({
          where: { id: p.id },
          data: { stock: computeStock(p.id, p.price) },
        })
      )
    );
    updated += batch.length;
  }

  // สรุป
  const summary = await prisma.$queryRaw<Array<{ bucket: string; count: bigint }>>`
    SELECT
      CASE
        WHEN stock <= 0 THEN '0'
        WHEN stock <= 5 THEN '1-5'
        WHEN stock <= 20 THEN '6-20'
        WHEN stock <= 50 THEN '21-50'
        WHEN stock <= 100 THEN '51-100'
        ELSE '101+'
      END AS bucket,
      COUNT(*) AS count
    FROM "Product"
    GROUP BY bucket
    ORDER BY MIN(stock)
  `;

  return NextResponse.json({
    mode: "update",
    updated,
    onlyZero,
    summary: summary.map((s) => ({ bucket: s.bucket, count: Number(s.count) })),
    message: `อัปเดต stock ${updated.toLocaleString()} รายการสำเร็จ`,
  });
}
