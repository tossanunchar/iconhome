import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentAdmin, getCurrentUser } from "@/lib/auth";
import { validateBody } from "@/lib/validate";
import { orderCreateSchema } from "@/lib/schemas";

export async function GET(req: NextRequest) {
  // ---- admin-only ----
  const admin = await getCurrentAdmin();
  if (!admin?.adminId) {
    return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;
  const status = searchParams.get("status") || "";

  const where: any = {};
  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: true, user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({ orders, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  // ---- Zod validation ----
  const parsed = await validateBody(req, orderCreateSchema);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  const userPayload = await getCurrentUser();

  // ---- ดึงราคาจริงจาก DB (ห้ามเชื่อราคาจาก client) ----
  const productIds = body.items.map((r) => r.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, price: true, images: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  for (const r of body.items) {
    if (!productMap.has(r.productId)) {
      return NextResponse.json({ error: `ไม่พบสินค้า id=${r.productId}` }, { status: 400 });
    }
  }

  // ---- คำนวณยอดรวมฝั่ง server ----
  let computedTotal = 0;
  const orderItemsData = body.items.map((r) => {
    const p = productMap.get(r.productId)!;
    computedTotal += p.price * r.quantity;
    let image: string | null = null;
    try {
      const arr = JSON.parse(p.images || "[]");
      if (Array.isArray(arr) && arr.length > 0) image = String(arr[0]);
    } catch { /* ignore */ }
    return {
      productId: p.id,
      name: p.name,
      price: p.price,
      quantity: r.quantity,
      image,
    };
  });
  computedTotal = Math.round(computedTotal * 100) / 100;

  // ---- ข้อมูลลูกค้า (รองรับ legacy keys: name/phone/email) ----
  const guestName = body.guestName || body.name || null;
  const guestPhone = body.guestPhone || body.phone || null;
  const guestEmail = body.guestEmail || body.email || null;

  if (!userPayload && !guestName) {
    return NextResponse.json({ error: "กรุณากรอกชื่อผู้สั่งซื้อ" }, { status: 400 });
  }
  if (!userPayload && !guestPhone) {
    return NextResponse.json({ error: "กรุณากรอกเบอร์โทรศัพท์" }, { status: 400 });
  }

  try {
    const order = await prisma.order.create({
      data: {
        userId: userPayload?.userId || null,
        guestName,
        guestPhone,
        guestEmail,
        address: body.address ?? null,
        notes: body.notes ?? null,
        total: computedTotal,
        status: "pending",
        items: { create: orderItemsData },
      },
      include: { items: true },
    });

    return NextResponse.json({ order });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
