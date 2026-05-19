import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const slug = body.name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
  const category = await prisma.category.create({
    data: { name: body.name, slug, icon: body.icon || null },
  });
  return NextResponse.json(category);
}
