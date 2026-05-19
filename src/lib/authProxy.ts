// Minimal auth helper สำหรับ proxy.ts — ห้าม import next/headers หรือ prisma
// (proxy ทำงานบน Edge runtime ไม่รองรับ Node API)
import { jwtVerify } from "jose";

export async function verifyAdminTokenProxy(token: string) {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret || secret.length < 32) {
    // ถ้า env หาย: refuse (อย่า return ค่าจริงโดยใช้ fallback hardcode)
    console.error("ADMIN_JWT_SECRET missing or too short in proxy");
    return null;
  }
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload as { adminId: number };
  } catch {
    return null;
  }
}
