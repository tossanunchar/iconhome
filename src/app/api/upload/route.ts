import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  // Production: use Vercel Blob
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const blob = await put(fileName, file, { access: "public" });
    return NextResponse.json({ url: blob.url });
  }

  // Development: save to public/uploads
  const { writeFile, mkdir } = await import("fs/promises");
  const path = await import("path");
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `product-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, fileName), buffer);
  return NextResponse.json({ url: `/uploads/${fileName}` });
}
