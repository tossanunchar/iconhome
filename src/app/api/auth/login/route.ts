import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { createUserToken, authCookieOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
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
