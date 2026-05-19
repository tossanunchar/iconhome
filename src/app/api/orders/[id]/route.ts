import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentAdmin, getCurrentUser } from "@/lib/auth";
import { validateBody } from "@/lib/validate";
import { orderUpdateSchema } from "@/lib/schemas";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orderId = parseInt(id);
  if (!Number.isFinite(orderId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const [admin, user] = await Promise.all([getCurrentAdmin(), getCurrentUser()]);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } }, user: true },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // ---- ownership check ----
  const isAdmin = !!admin?.adminId;
  const isOwner = !!user?.userId && order.userId === user.userId;
  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 403 });
  }

  if (!isAdmin) {
    return NextResponse.json({
      ...order,
      user: order.user ? { name: order.user.name } : null,
    });
  }

  return NextResponse.json(order);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // ---- admin-only ----
  const admin = await getCurrentAdmin();
  if (!admin?.adminId) {
    return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 });
  }

  const { id } = await params;
  const orderId = parseInt(id);
  if (!Number.isFinite(orderId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const parsed = await validateBody(req, orderUpdateSchema);
  if (!parsed.ok) return parsed.response;
  const data = parsed.data;

  const order = await prisma.order.update({
    where: { id: orderId },
    data,
    include: { items: true },
  });
  return NextResponse.json(order);
}
