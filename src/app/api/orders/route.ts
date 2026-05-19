import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentAdmin, getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  // ---- admin-only: รายการ order ทั้งหมด (ไว้ใช้ในแอดมิน) ----
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
  const body = await req.json();
  const userPayload = await getCurrentUser();

  // ---- 1. validate items ----
  const inputItems = Array.isArray(body.items) ? body.items : [];
  if (inputItems.length === 0) {
    return NextResponse.json({ error: "ตะกร้าว่าง" }, { status: 400 });
  }
  if (inputItems.length > 100) {
    return NextResponse.json({ error: "จำนวนสินค้าในตะกร้าเกินขีดจำกัด" }, { status: 400 });
  }

  type InputItem = { productId?: unknown; quantity?: unknown };
  const requests: { productId: number; quantity: number }[] = [];
  for (const raw of inputItems as InputItem[]) {
    const productId = typeof raw.productId === "number" ? raw.productId : parseInt(String(raw.productId ?? ""));
    const quantity = typeof raw.quantity === "number" ? raw.quantity : parseInt(String(raw.quantity ?? ""));
    if (!Number.isFinite(productId) || productId <= 0) {
      return NextResponse.json({ error: "รหัสสินค้าไม่ถูกต้อง" }, { status: 400 });
    }
    if (!Number.isFinite(quantity) || quantity <= 0 || quantity > 999) {
      return NextResponse.json({ error: "จำนวนสินค้าไม่ถูกต้อง" }, { status: 400 });
    }
    requests.push({ productId, quantity });
  }

  // ---- 2. ดึงราคาจริงจาก DB (ห้ามเชื่อราคาจาก client) ----
  const productIds = requests.map((r) => r.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, price: true, images: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  // ตรวจว่ามีสินค้าจริงทุกตัว
  for (const r of requests) {
    if (!productMap.has(r.productId)) {
      return NextResponse.json({ error: `ไม่พบสินค้า id=${r.productId}` }, { status: 400 });
    }
  }

  // ---- 3. คำนวณยอดรวมฝั่ง server ----
  let computedTotal = 0;
  const orderItemsData = requests.map((r) => {
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

  // ปัดเศษ 2 ตำแหน่ง (ราคาเป็น float)
  computedTotal = Math.round(computedTotal * 100) / 100;

  // ---- 4. validate ข้อมูลลูกค้า ----
  const guestName = typeof body.guestName === "string" ? body.guestName : (typeof body.name === "string" ? body.name : null);
  const guestPhone = typeof body.guestPhone === "string" ? body.guestPhone : (typeof body.phone === "string" ? body.phone : null);
  const guestEmail = typeof body.guestEmail === "string" ? body.guestEmail : (typeof body.email === "string" ? body.email : null);
  const address = typeof body.address === "string" ? body.address : null;
  const notes = typeof body.notes === "string" ? body.notes : null;

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
        address,
        notes,
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
