import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// ---- บังคับให้ตั้ง env: ไม่มี fallback hardcode (ป้องกัน JWT forgery ถ้า env หาย) ----
function requireSecret(name: string): Uint8Array {
  const v = process.env[name];
  if (!v || v.length < 32) {
    // ถ้า build ตอน prerender ก็จะ throw — เราอยาก fail loud
    throw new Error(`Missing or weak ${name} (need at least 32 chars). Set it in environment.`);
  }
  return new TextEncoder().encode(v);
}

// lazy: เรียกใช้ตอน function เรียก ไม่ใช่ตอน import — กัน build ตอนไม่มี env
function userSecret() { return requireSecret("JWT_SECRET"); }
function adminSecret() { return requireSecret("ADMIN_JWT_SECRET"); }

// ---- Cookie option helper: secure ใน production, lax+httpOnly เสมอ ----
export function authCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: maxAgeSeconds,
    path: "/",
  };
}

// ---- Customer auth ----
export async function createUserToken(userId: number) {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(userSecret());
}

export async function verifyUserToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, userSecret());
    return payload as { userId: number };
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("user_token")?.value;
  if (!token) return null;
  return verifyUserToken(token);
}

// ---- Admin auth ----
export async function createAdminToken(adminId: number) {
  return await new SignJWT({ adminId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(adminSecret());
}

export async function verifyAdminToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, adminSecret());
    return payload as { adminId: number };
  } catch {
    return null;
  }
}

export async function getCurrentAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}
