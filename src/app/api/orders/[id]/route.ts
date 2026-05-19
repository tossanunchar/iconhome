import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentAdmin, getCurrentUser } from "@/lib/auth";

const ALLOWED_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orderId = parseInt(id);
  if (!Number.isFinite(orderId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  // ตรวจ session: admin เห็นได้ทุก order, user เห็นเฉพาะของตัวเอง
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
    // guest order: ไม่มี userId — ต้อง login admin เท่านั้น
    // (guest จะตาม order ผ่านลิงก์อีเมล/SMS ในอนาคต — ตอนนี้บล็อกไปก่อน)
    return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 403 });
  }

  // ถ้าไม่ใช่ admin ตัดข้อมูล user ออก
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

  const body = await req.json();

  // ---- validate status ----
  const data: { status?: string; notes?: string | null } = {};
  if (body.status !== undefined) {
    if (typeof body.status !== "string" || !ALLOWED_STATUSES.includes(body.status as typeof ALLOWED_STATUSES[number])) {
      return NextResponse.json({ error: "สถานะไม่ถูกต้อง" }, { status: 400 });
    }
    data.status = body.status;
  }
  if (body.notes !== undefined) {
    if (body.notes !== null && typeof body.notes !== "string") {
      return NextResponse.json({ error: "notes ต้องเป็นข้อความ" }, { status: 400 });
    }
    data.notes = body.notes;
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data,
    include: { items: true },
  });
  return NextResponse.json(order);
}
