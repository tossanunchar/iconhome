import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) },
    include: { category: true },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ...product, images: JSON.parse(product.images || "[]") });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const product = await prisma.product.update({
    where: { id: parseInt(id) },
    data: {
      name: body.name,
      description: body.description,
      price: parseFloat(body.price),
      originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : null,
      stock: parseInt(body.stock) || 0,
      images: JSON.stringify(body.images || []),
      badge: body.badge || null,
      brand: body.brand || null,
      categoryId: body.categoryId ? parseInt(body.categoryId) : null,
    },
    include: { category: true },
  });
  return NextResponse.json({ ...product, images: JSON.parse(product.images) });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.product.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ ok: true });
}
