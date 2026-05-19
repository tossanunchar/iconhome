import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
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

  try {
    const order = await prisma.order.create({
      data: {
        userId: userPayload?.userId || null,
        guestName: body.guestName || body.name || null,
        guestPhone: body.guestPhone || body.phone || null,
        guestEmail: body.guestEmail || body.email || null,
        address: body.address || null,
        notes: body.notes || null,
        total: parseFloat(body.total),
        status: "pending",
        items: {
          create: (body.items || []).map((item: any) => ({
            productId: item.productId || null,
            name: item.name,
            price: parseFloat(item.price),
            quantity: parseInt(item.quantity),
            image: item.image || null,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ order });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
