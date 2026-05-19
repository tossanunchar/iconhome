import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });

async function main() {
  console.log("Seeding database...");

  // Create admin account
  const adminPassword = await bcrypt.hash("admin1234", 10);
  await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: { username: "admin", password: adminPassword },
  });
  console.log("Admin created: username=admin password=admin1234");

  // Create categories
  const cats = [
    { name: "เครื่องปรับอากาศ", slug: "air-conditioner", icon: "ac" },
    { name: "เครื่องซักผ้า", slug: "washing-machine", icon: "washer" },
    { name: "ตู้เย็น", slug: "refrigerator", icon: "fridge" },
    { name: "โทรทัศน์", slug: "tv", icon: "tv" },
    { name: "วัสดุก่อสร้าง", slug: "construction", icon: "build" },
    { name: "กระเบื้อง", slug: "tile", icon: "tile" },
    { name: "สุขภัณฑ์", slug: "sanitary", icon: "sanitary" },
    { name: "เหล็กเส้น", slug: "steel", icon: "steel" },
  ];

  for (const cat of cats) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("Categories created");

  const acCat = await prisma.category.findUnique({ where: { slug: "air-conditioner" } });
  const fridgeCat = await prisma.category.findUnique({ where: { slug: "refrigerator" } });
  const washerCat = await prisma.category.findUnique({ where: { slug: "washing-machine" } });

  // Create sample products
  const products = [
    { name: "แอร์ LG S3-Q18JA3QA 18,000 BTU Inverter", brand: "LG", price: 18990, originalPrice: 22990, categoryId: acCat?.id, badge: "NEW", stock: 15 },
    { name: "แอร์ DAIKIN FTKQ25XV1S 9,000 BTU Inverter", brand: "Daikin", price: 14990, originalPrice: 17990, categoryId: acCat?.id, badge: "NEW", stock: 20 },
    { name: "แอร์ SAMSUNG AR18TXHQASINST 18,000 BTU", brand: "Samsung", price: 15990, originalPrice: 19990, categoryId: acCat?.id, badge: "SALE", stock: 8 },
    { name: "แอร์ Mitsubishi MSY-JP25VF 9,500 BTU Inverter", brand: "Mitsubishi", price: 16990, originalPrice: 20990, categoryId: acCat?.id, badge: null, stock: 12 },
    { name: "แอร์ Hitachi RAS-DX10CF 10,000 BTU Inverter", brand: "Hitachi", price: 12990, originalPrice: 15990, categoryId: acCat?.id, badge: "SALE", stock: 5 },
    { name: "แอร์ Panasonic CS-XU12SKT 12,000 BTU Inverter", brand: "Panasonic", price: 13990, originalPrice: 16990, categoryId: acCat?.id, badge: null, stock: 10 },
    { name: "ตู้เย็น LG GN-B392PLGK 14 คิว Inverter", brand: "LG", price: 8990, originalPrice: 10990, categoryId: fridgeCat?.id, badge: "NEW", stock: 7 },
    { name: "ตู้เย็น Samsung RT38CG6020B1 2 ประตู 13.9 คิว", brand: "Samsung", price: 10990, originalPrice: 12990, categoryId: fridgeCat?.id, badge: "SALE", stock: 9 },
    { name: "เครื่องซักผ้า Samsung WW10T534DAW 10 กก. ฝาหน้า", brand: "Samsung", price: 11990, originalPrice: 14990, categoryId: washerCat?.id, badge: "NEW", stock: 6 },
    { name: "เครื่องซักผ้า LG FM1207N6W 7 กก. ฝาบน", brand: "LG", price: 6990, originalPrice: 8990, categoryId: washerCat?.id, badge: null, stock: 14 },
  ];

  for (const p of products) {
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-") + "-" + Date.now() + Math.random().toString(36).slice(2,5);
    await prisma.product.create({
      data: {
        name: p.name,
        slug,
        description: `สินค้าคุณภาพสูงจากแบรนด์ ${p.brand} รับประกันศูนย์ไทย พร้อมติดตั้ง`,
        price: p.price,
        originalPrice: p.originalPrice,
        stock: p.stock,
        images: JSON.stringify([]),
        badge: p.badge || null,
        brand: p.brand,
        categoryId: p.categoryId || null,
      },
    });
  }
  console.log("Sample products created");
  console.log("Seed completed!");
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
