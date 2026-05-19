import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { getCurrentAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  // ---- 1. ตรวจสิทธิ์ ----
  const session = await getCurrentAdmin();
  if (!session?.adminId) {
    return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 });
  }

  // ---- 2. รับ + validate input ----
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const { currentPassword, newPassword, confirmPassword } = (body ?? {}) as {
    currentPassword?: unknown;
    newPassword?: unknown;
    confirmPassword?: unknown;
  };

  if (typeof currentPassword !== "string" || typeof newPassword !== "string" || typeof confirmPassword !== "string") {
    return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร" }, { status: 400 });
  }
  if (newPassword.length > 100) {
    return NextResponse.json({ error: "รหัสผ่านใหม่ยาวเกินไป" }, { status: 400 });
  }
  if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    return NextResponse.json({ error: "รหัสผ่านต้องประกอบด้วยตัวอักษรและตัวเลข" }, { status: 400 });
  }
  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: "ยืนยันรหัสผ่านไม่ตรงกัน" }, { status: 400 });
  }
  if (newPassword === currentPassword) {
    return NextResponse.json({ error: "รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสเดิม" }, { status: 400 });
  }

  // ---- 3. ตรวจรหัสปัจจุบัน ----
  const admin = await prisma.admin.findUnique({ where: { id: session.adminId } });
  if (!admin) {
    return NextResponse.json({ error: "ไม่พบบัญชี" }, { status: 404 });
  }
  const valid = await bcrypt.compare(currentPassword, admin.password);
  if (!valid) {
    return NextResponse.json({ error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" }, { status: 401 });
  }

  // ---- 4. hash + บันทึก ----
  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.admin.update({
    where: { id: admin.id },
    data: { password: hashed },
  });

  return NextResponse.json({ ok: true });
}
