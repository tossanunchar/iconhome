import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

async function requireAdmin() {
  const session = await getCurrentAdmin();
  if (!session?.adminId) {
    return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 });
  }
  return null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productId = parseInt(id);
  if (!Number.isFinite(productId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { category: true },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ...product, images: JSON.parse(product.images || "[]") });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const productId = parseInt(id);
  if (!Number.isFinite(productId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const body = await req.json();

  const price = parseFloat(body.price);
  const originalPrice = body.originalPrice ? parseFloat(body.originalPrice) : null;
  const stock = parseInt(body.stock);
  const categoryId = body.categoryId ? parseInt(body.categoryId) : null;

  if (!body.name || typeof body.name !== "string") {
    return NextResponse.json({ error: "กรุณากรอกชื่อสินค้า" }, { status: 400 });
  }
  if (!Number.isFinite(price) || price < 0) {
    return NextResponse.json({ error: "ราคาไม่ถูกต้อง" }, { status: 400 });
  }
  if (originalPrice !== null && (!Number.isFinite(originalPrice) || originalPrice < 0)) {
    return NextResponse.json({ error: "ราคาเดิมไม่ถูกต้อง" }, { status: 400 });
  }

  const product = await prisma.product.update({
    where: { id: productId },
    data: {
      name: body.name,
      description: body.description,
      price,
      originalPrice,
      stock: Number.isFinite(stock) ? stock : 0,
      images: JSON.stringify(Array.isArray(body.images) ? body.images : []),
      badge: body.badge || null,
      brand: body.brand || null,
      categoryId,
    },
    include: { category: true },
  });
  return NextResponse.json({ ...product, images: JSON.parse(product.images) });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const productId = parseInt(id);
  if (!Number.isFinite(productId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  await prisma.product.delete({ where: { id: productId } });
  return NextResponse.json({ ok: true });
}
