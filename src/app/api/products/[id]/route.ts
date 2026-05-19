import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { validateBody } from "@/lib/validate";
import { productUpdateSchema } from "@/lib/schemas";

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

  // ---- Zod ----
  const parsed = await validateBody(req, productUpdateSchema);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  const product = await prisma.product.update({
    where: { id: productId },
    data: {
      name: body.name,
      description: body.description,
      price: body.price,
      originalPrice: body.originalPrice ?? null,
      stock: body.stock,
      images: JSON.stringify(body.images ?? []),
      badge: body.badge ?? null,
      brand: body.brand ?? null,
      categoryId: body.categoryId ?? null,
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
