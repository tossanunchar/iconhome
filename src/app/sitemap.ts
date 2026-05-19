import type { MetadataRoute } from "next";
import prisma from "@/lib/db";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.iconhometh.com";

export const revalidate = 3600; // regenerate ทุก 1 ชม.

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ---- หน้า static ----
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/category`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  // ---- หมวดหมู่ ----
  const categories = await prisma.category.findMany({
    select: { slug: true },
  });
  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/category?category=${c.slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // ---- สินค้า (route จริงคือ /product/[id]) ----
  // หมายเหตุ: ถ้ามีสินค้าเยอะมาก (50K+) ควรใช้ generateSitemaps แบ่งหลายไฟล์
  const products = await prisma.product.findMany({
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 45000, // Google จำกัด 50K urls per sitemap
  });
  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/product/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
