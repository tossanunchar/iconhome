import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { createAdminToken, authCookieOptions } from "@/lib/auth";
import { rateLimit, getClientIP } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  // ---- rate limit: 5 attempts / 15 min ต่อ IP + 10 / 15 min ต่อ username ----
  const ip = getClientIP(req);
  const ipLimit = rateLimit(`admin-login:ip:${ip}`, 10, 15 * 60_000);
  if (!ipLimit.allowed) {
    const secs = Math.ceil(ipLimit.resetMs / 1000);
    return NextResponse.json(
      { error: `พยายามเข้าระบบบ่อยเกินไป กรุณารอ ${secs} วินาที` },
      { status: 429, headers: { "Retry-After": String(secs) } }
    );
  }

  const { username, password } = await req.json();
  if (typeof username !== "string" || typeof password !== "string" || !username || !password) {
    return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
  }

  const userLimit = rateLimit(`admin-login:user:${username.toLowerCase()}`, 5, 15 * 60_000);
  if (!userLimit.allowed) {
    const secs = Math.ceil(userLimit.resetMs / 1000);
    return NextResponse.json(
      { error: `บัญชีนี้ถูกล็อกชั่วคราว กรุณารอ ${secs} วินาที` },
      { status: 429, headers: { "Retry-After": String(secs) } }
    );
  }

  const admin = await prisma.admin.findUnique({ where: { username } });
  // ทำ compare ทั้ง 2 กรณีเพื่อกัน timing attack
  const dummyHash = "$2a$10$CwTycUXWue0Thq9StjUM0uJ8/p9z5SbS6kkVcXLcLZJ/9z5SbS6kk";
  const valid = admin
    ? await bcrypt.compare(password, admin.password)
    : (await bcrypt.compare(password, dummyHash), false);

  if (!admin || !valid) {
    return NextResponse.json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  }

  const token = await createAdminToken(admin.id);
  const response = NextResponse.json({ ok: true, admin: { id: admin.id, username: admin.username } });
  response.cookies.set("admin_token", token, authCookieOptions(60 * 60 * 8));
  return response;
}
