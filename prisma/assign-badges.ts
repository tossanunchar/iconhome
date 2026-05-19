import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Script ใส่ badge ให้สินค้า
// - NEW: สินค้า 100 รายการล่าสุด
// - SALE: สินค้าที่มี originalPrice > price (ถ้ามี) — ปัจจุบันยังไม่มี เพราะ import ไม่ได้ใส่ originalPrice
//
// รันด้วย:
//   DATABASE_URL="postgres://..." npx tsx prisma/assign-badges.ts

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🏷️  เริ่มใส่ badge ให้สินค้า...");

  // ---- 1. ลบ badge เก่าทั้งหมดก่อน เพื่อ idempotent ----
  console.log("🗑️  ลบ badge เก่า...");
  const cleared = await prisma.product.updateMany({
    where: { badge: { not: null } },
    data: { badge: null },
  });
  console.log(`   ลบ ${cleared.count} รายการ`);

  // ---- 2. NEW badge: สินค้า 100 รายการล่าสุด ----
  console.log("✨ ใส่ NEW badge ให้สินค้า 100 ล่าสุด...");
  const newest = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true },
  });
  const newResult = await prisma.product.updateMany({
    where: { id: { in: newest.map((p) => p.id) } },
    data: { badge: "NEW" },
  });
  console.log(`   ✅ ${newResult.count} รายการ`);

  // ---- 3. SALE badge: สินค้าที่ originalPrice > price ----
  // หมายเหตุ: ถ้ายังไม่มี originalPrice เป็น optional ใน DB จะข้าม
  const saleCandidates = await prisma.$queryRaw<Array<{ id: number }>>`
    SELECT id FROM "Product"
    WHERE "originalPrice" IS NOT NULL
      AND "originalPrice" > price
    ORDER BY ("originalPrice" - price) DESC
    LIMIT 200
  `;
  if (saleCandidates.length > 0) {
    console.log(`💰 ใส่ SALE badge ให้สินค้า ${saleCandidates.length} รายการ...`);
    const saleResult = await prisma.product.updateMany({
      where: { id: { in: saleCandidates.map((p) => p.id) } },
      data: { badge: "SALE" },
    });
    console.log(`   ✅ ${saleResult.count} รายการ`);
  } else {
    console.log("ℹ️  ยังไม่มีสินค้าที่ originalPrice > price (ข้าม SALE badge)");
  }

  // ---- 4. HOT badge: สินค้าที่ราคาแพงสุด 30 รายการ ----
  // (สมมุติว่า "HOT" = สินค้าราคาสูง = สินค้าโชว์เด่น)
  // ถ้าอยากเปลี่ยน logic เป็น "ขายดี" ต้อง query จาก OrderItem
  console.log("🔥 ใส่ HOT badge ให้สินค้าราคาสูงสุด 30 รายการ...");
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
  console.log(`   ✅ ${hotResult.count} รายการ`);

  // ---- สรุป ----
  const summary = await prisma.product.groupBy({
    by: ["badge"],
    _count: true,
  });
  console.log("\n📊 สรุป badge:");
  for (const row of summary) {
    console.log(`   ${row.badge ?? "(ไม่มี)"}: ${row._count}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => process.exit(0));
