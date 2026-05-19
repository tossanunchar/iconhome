import { NextRequest, NextResponse } from "next/server";
import { verifyAdminTokenProxy } from "@/lib/authProxy";

// ใน Next.js 16 ไฟล์นี้ชื่อ proxy.ts (เดิมคือ middleware.ts)
// หน้าที่:
//   1. กั้น /admin/* ถ้าไม่มี admin_token หรือ token หมดอายุ → redirect ไป /admin/login
//   2. ใส่ security headers ให้ทุก response ที่ผ่าน matcher

const ADMIN_LOGIN_PATH = "/admin/login";

function withSecurityHeaders(res: NextResponse): NextResponse {
  // ป้องกัน clickjacking (allow same-origin iframe เผื่อ admin preview)
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  // ป้องกัน MIME-type sniffing
  res.headers.set("X-Content-Type-Options", "nosniff");
  // จำกัด referrer ที่ส่งออกตอน navigate ออกนอกเว็บ
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // ปิด API browser ที่เว็บนี้ไม่ใช้
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );
  // HSTS — บังคับใช้ HTTPS 2 ปี + preload list (เฉพาะ production)
  if (process.env.NODE_ENV === "production") {
    res.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }
  return res;
}

// CSRF: เช็คว่า request ที่เปลี่ยน state มาจาก origin เดียวกัน
function isSameOrigin(req: NextRequest): boolean {
  const method = req.method.toUpperCase();
  // safe methods — ข้าม
  if (["GET", "HEAD", "OPTIONS"].includes(method)) return true;

  const host = req.headers.get("host");
  if (!host) return false;

  const origin = req.headers.get("origin");
  if (origin) {
    try {
      const o = new URL(origin);
      return o.host === host;
    } catch {
      return false;
    }
  }

  // ไม่มี Origin header → ดู Referer (เก่ากว่า แต่ก็พอใช้)
  const referer = req.headers.get("referer");
  if (referer) {
    try {
      const r = new URL(referer);
      return r.host === host;
    } catch {
      return false;
    }
  }

  // ไม่มีทั้ง Origin ทั้ง Referer + เป็น mutating request → block
  return false;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ---- 0. CSRF: บล็อก mutating request ที่มาจาก cross-origin ----
  // ใช้กับ /api/* (ยกเว้น webhook ถ้ามีในอนาคต)
  if (pathname.startsWith("/api/") && !isSameOrigin(req)) {
    return new NextResponse(
      JSON.stringify({ error: "Cross-origin request blocked" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // ---- 1. กั้น /admin/* (ยกเว้นหน้า login) ----
  if (pathname.startsWith("/admin") && pathname !== ADMIN_LOGIN_PATH) {
    const token = req.cookies.get("admin_token")?.value;
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = ADMIN_LOGIN_PATH;
      url.search = "";
      return withSecurityHeaders(NextResponse.redirect(url));
    }
    const payload = await verifyAdminTokenProxy(token);
    if (!payload) {
      const url = req.nextUrl.clone();
      url.pathname = ADMIN_LOGIN_PATH;
      url.search = "";
      return withSecurityHeaders(NextResponse.redirect(url));
    }
  }

  // ---- 2. ใส่ security headers ให้ทุก response ----
  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  // run บนทุก path ยกเว้น Next internals, image optim, favicon, static assets
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map)$).*)",
  ],
};
