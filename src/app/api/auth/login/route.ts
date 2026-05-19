import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { createUserToken, authCookieOptions } from "@/lib/auth";
import { rateLimit, getClientIP } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  // ---- rate limit ----
  const ip = getClientIP(req);
  const ipLimit = rateLimit(`login:ip:${ip}`, 20, 15 * 60_000);
  if (!ipLimit.allowed) {
    const secs = Math.ceil(ipLimit.resetMs / 1000);
    return NextResponse.json(
      { error: `พยายามเข้าระบบบ่อยเกินไป กรุณารอ ${secs} วินาที` },
      { status: 429, headers: { "Retry-After": String(secs) } }
    );
  }

  const { email, password } = await req.json();
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
  }

  const userLimit = rateLimit(`login:email:${email.toLowerCase()}`, 8, 15 * 60_000);
  if (!userLimit.allowed) {
    const secs = Math.ceil(userLimit.resetMs / 1000);
    return NextResponse.json(
      { error: `บัญชีนี้ถูกล็อกชั่วคราว กรุณารอ ${secs} วินาที` },
      { status: 429, headers: { "Retry-After": String(secs) } }
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  // กัน timing attack
  const dummyHash = "$2a$10$CwTycUXWue0Thq9StjUM0uJ8/p9z5SbS6kkVcXLcLZJ/9z5SbS6kk";
  const valid = user
    ? await bcrypt.compare(password, user.password)
    : (await bcrypt.compare(password, dummyHash), false);

  if (!user || !valid) {
    return NextResponse.json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  }

  const token = await createUserToken(user.id);
  const response = NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email } });
  response.cookies.set("user_token", token, authCookieOptions(60 * 60 * 24 * 7));
  return response;
}
