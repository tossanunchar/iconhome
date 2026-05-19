import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as XLSX from "xlsx";
import * as path from "path";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Map หมวดหมู่จากไฟล์ → slug + icon
const CATEGORY_MAP: Record<string, { slug: string; icon: string }> = {
  "โครงสร้าง":                       { slug: "construction",   icon: "build"      },
  "ประตู- หน้าต่าง":                  { slug: "door-window",    icon: "door"       },
  "เครื่องมือช่าง":                   { slug: "tools",          icon: "tools"      },
  "ไฟฟ้า- อุปกรณ์":                   { slug: "electrical",     icon: "electric"   },
  "กระเบื้อง- สุขภัณฑ์- อุปกรณ์":    { slug: "tile-sanitary",  icon: "tile"       },
  "สี- เคมีภัณฑ์":                    { slug: "paint",          icon: "paint"      },
  "ประปา- เกษตรสวน":                  { slug: "plumbing",       icon: "plumbing"   },
  "เฟอร์นิเจอร์":                     { slug: "furniture",      icon: "furniture"  },
  "เครื่องใช้ไฟฟ้า":                  { slug: "appliance",      icon: "appliance"  },
  "ของใช้ในบ้าน":                     { slug: "household",      icon: "home"       },
  "สรรไท- พียูโพม":                   { slug: "foam",           icon: "foam"       },
  "สินค้าและบริการ":                  { slug: "services",       icon: "service"    },
  "ของใช้สำนักงาน":                   { slug: "office",         icon: "office"     },
  "Solar Cell":                        { slug: "solar",          icon: "solar"      },
};

async function main() {
  const filePath = path.resolve("D:/Aon/products_20260518.xlsx");
  console.log("📂 อ่านไฟล์:", filePath);

  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const allRows: any[] = XLSX.utils.sheet_to_json(ws);

  // กรองเฉพาะที่มีราคา > 0
  const rows = allRows.filter((r) => r["ราคาขาย (บาท)"] > 0);
  console.log(`✅ สินค้ามีราคา: ${rows.length} รายการ (จาก ${allRows.length})`);

  // --- ลบสินค้าและ order items เดิม ---
  console.log("🗑️  ลบสินค้าเดิม...");
  await prisma.orderItem.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  console.log("✅ ลบเรียบร้อย");

  // --- สร้าง categories ใหม่ ---
  console.log("📁 สร้างหมวดหมู่...");
  const uniqueCats = [...new Set(rows.map((r) => r["หมวดหมู่"] as string))];
  const catIdMap: Record<string, number> = {};

  for (const catName of uniqueCats) {
    const meta = CATEGORY_MAP[catName] ?? { slug: catName.toLowerCase().replace(/[^a-z0-9ก-๙]/g, "-"), icon: "default" };
    const cat = await prisma.category.upsert({
      where: { slug: meta.slug },
      update: {},
      create: { name: catName, slug: meta.slug, icon: meta.icon },
    });
    catIdMap[catName] = cat.id;
  }
  console.log(`✅ สร้างหมวดหมู่ ${uniqueCats.length} หมวด`);

  // --- import สินค้า (batch 500) ---
  console.log("📦 import สินค้า...");
  const BATCH = 500;
  let count = 0;
  const usedSlugs = new Set<string>();

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const data = batch.map((r) => {
      // สร้าง slug จาก รหัสสินค้า
      const baseSlug = String(r["รหัสสินค้า"]).toLowerCase().replace(/[^a-z0-9]/g, "-");
      let slug = baseSlug;
      let n = 2;
      while (usedSlugs.has(slug)) { slug = `${baseSlug}-${n++}`; }
      usedSlugs.add(slug);

      return {
        name:        String(r["ชื่อสินค้า"]),
        slug,
        description: `${r["ประเภท"]} | ${r["แบรนด์"]}`,
        price:       Number(r["ราคาขาย (บาท)"]),
        stock:       0,
        images:      "[]",
        brand:       r["แบรนด์"] !== "ไม่กำหนดยี่ห้อ" ? String(r["แบรนด์"]) : null,
        categoryId:  catIdMap[r["หมวดหมู่"]] ?? null,
        badge:       null,
      };
    });

    await prisma.product.createMany({ data, skipDuplicates: true });
    count += data.length;
    process.stdout.write(`\r  ${count}/${rows.length} รายการ...`);
  }

  console.log(`\n✅ import สินค้าสำเร็จ ${count} รายการ!`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => process.exit(0));
