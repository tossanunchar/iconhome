import { NextResponse } from "next/server";
import { getCategories, getTopBrands } from "@/lib/siteData";

// Public — categories + top brands สำหรับ filter UI ใน category page
export async function GET() {
  const [categories, brands] = await Promise.all([
    getCategories(),
    getTopBrands(20),
  ]);
  return NextResponse.json({ categories, brands });
}
