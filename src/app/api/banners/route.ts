import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyAdminToken } from "@/lib/auth";
import { cookies } from "next/headers";

// Public GET — return active banners ordered by position
export async function GET() {
  const banners = await prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { position: "asc" },
  });
  return NextResponse.json({ banners });
}

// Admin POST — create banner
export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const banner = await prisma.banner.create({
    data: {
      title: body.title || null,
      imageUrl: body.imageUrl,
      linkUrl: body.linkUrl || null,
      position: body.position ?? 0,
      isActive: body.isActive ?? true,
    },
  });
  return NextResponse.json({ banner });
}
