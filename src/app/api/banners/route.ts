import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { validateBody } from "@/lib/validate";
import { bannerSchema } from "@/lib/schemas";

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
  const session = await getCurrentAdmin();
  if (!session?.adminId) {
    return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 });
  }

  const parsed = await validateBody(req, bannerSchema);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  const banner = await prisma.banner.create({
    data: {
      title: body.title ?? null,
      imageUrl: body.imageUrl,
      linkUrl: body.linkUrl ?? null,
      position: body.position,
      isActive: body.isActive,
    },
  });
  return NextResponse.json({ banner });
}
