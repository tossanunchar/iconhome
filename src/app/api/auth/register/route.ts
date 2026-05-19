import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { createUserToken, authCookieOptions } from "@/lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, password, phone } = body ?? {};

  if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }
  if (!name.trim() || !email.trim() || !password) {
    return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "รูปแบบอีเมลไม่ถูกต้อง" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "อีเมลนี้มีบัญชีอยู่แล้ว" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name: name.trim(), email, password: hashedPassword, phone: phone || null },
  });

  const token = await createUserToken(user.id);
  const response = NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email } });
  response.cookies.set("user_token", token, authCookieOptions(60 * 60 * 24 * 7));
  return response;
}
