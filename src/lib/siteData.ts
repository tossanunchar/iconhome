// Shared data fetchers สำหรับใช้ใน layout.tsx + page components
// ใช้ React cache() เพื่อ memoize per-request (1 query / request)
import { cache } from "react";
import prisma from "@/lib/db";

export type CategoryItem = { id: number; name: string; slug: string };

export const getCategories = cache(async (): Promise<CategoryItem[]> => {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
});

export const getTopBrands = cache(async (limit = 12): Promise<string[]> => {
  const rows = await prisma.$queryRaw<Array<{ brand: string }>>`
    SELECT brand FROM "Product"
    WHERE brand IS NOT NULL
    GROUP BY brand
    ORDER BY COUNT(*) DESC
    LIMIT ${limit}
  `;
  return rows.map((r) => r.brand);
});
