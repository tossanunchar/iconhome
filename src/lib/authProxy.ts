// Minimal auth for proxy.ts — no next/headers imports (not allowed in proxy context)
import { jwtVerify } from "jose";

const ADMIN_JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "iconhome-admin-secret-key-2024-very-long"
);

export async function verifyAdminTokenProxy(token: string) {
  try {
    const { payload } = await jwtVerify(token, ADMIN_JWT_SECRET);
    return payload as { adminId: number };
  } catch {
    return null;
  }
}
