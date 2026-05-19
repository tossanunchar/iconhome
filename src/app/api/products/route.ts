import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const brand = searchParams.get("brand") || "";
  const badge = searchParams.get("badge") || "";
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "12"), 100);
  const sort = searchParams.get("sort") || "newest";

  const slug = searchParams.get("slug") || "";

  const where: any = {};
  if (slug) {
    // Exact slug lookup
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { category: true },
    });
    if (!product) return NextResponse.json({ products: [], total: 0, page: 1, totalPages: 0 });
    return NextResponse.json({
      products: [{ ...product, images: JSON.parse(product.images || "[]") }],
      total: 1, page: 1, totalPages: 1,
    });
  }
  if (q) where.name = { contains: q };
  if (brand) where.brand = { contains: brand };
  if (badge) where.badge = badge;
  if (category) where.category = { slug: category };
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }

  let orderBy: any = { createdAt: "desc" };
  if (sort === "price_asc") orderBy = { price: "asc" };
  if (sort === "price_desc") orderBy = { price: "desc" };
  if (sort === "popular") orderBy = { createdAt: "desc" };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    products: products.map((p) => ({
      ...p,
      images: JSON.parse(p.images || "[]"),
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(req: NextRequest) {
  // ---- ตรวจสิทธิ์ admin ----
  const session = await getCurrentAdmin();
  if (!session?.adminId) {
    return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 });
  }

  const body = await req.json();

  if (!body.name || typeof body.name !== "string") {
    return NextResponse.json({ error: "กรุณากรอกชื่อสินค้า" }, { status: 400 });
  }
  const price = parseFloat(body.price);
  if (!Number.isFinite(price) || price < 0) {
    return NextResponse.json({ error: "ราคาไม่ถูกต้อง" }, { status: 400 });
  }
  const originalPrice = body.originalPrice ? parseFloat(body.originalPrice) : null;
  if (originalPrice !== null && (!Number.isFinite(originalPrice) || originalPrice < 0)) {
    return NextResponse.json({ error: "ราคาเดิมไม่ถูกต้อง" }, { status: 400 });
  }

  const slug = body.name
    .toLowerCase()
    .replace(/[^a-z0-9฀-๿]/g, "-")
    .replace(/-+/g, "-") + "-" + Date.now();

  const product = await prisma.product.create({
    data: {
      name: body.name,
      slug,
      description: body.description || "",
      price,
      originalPrice,
      stock: parseInt(body.stock) || 0,
      images: JSON.stringify(Array.isArray(body.images) ? body.images : []),
      badge: body.badge || null,
      brand: body.brand || null,
      categoryId: body.categoryId ? parseInt(body.categoryId) : null,
    },
    include: { category: true },
  });

  return NextResponse.json({
    ...product,
    images: JSON.parse(product.images),
  });
}
