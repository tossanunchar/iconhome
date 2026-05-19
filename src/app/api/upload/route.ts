import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME: Record<string, { ext: string; magic: Uint8Array[] }> = {
  "image/jpeg": {
    ext: "jpg",
    magic: [new Uint8Array([0xff, 0xd8, 0xff])],
  },
  "image/png": {
    ext: "png",
    magic: [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
  },
  "image/webp": {
    ext: "webp",
    // RIFF????WEBP — ตรวจ RIFF + WEBP ที่ตำแหน่ง 8
    magic: [new Uint8Array([0x52, 0x49, 0x46, 0x46])],
  },
  "image/gif": {
    ext: "gif",
    magic: [
      new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]), // GIF87a
      new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]), // GIF89a
    ],
  },
};

function startsWith(buf: Uint8Array, sig: Uint8Array): boolean {
  if (buf.length < sig.length) return false;
  for (let i = 0; i < sig.length; i++) {
    if (buf[i] !== sig[i]) return false;
  }
  return true;
}

function isValidMagic(buf: Uint8Array, mime: string): boolean {
  const spec = ALLOWED_MIME[mime];
  if (!spec) return false;
  // webp: ต้องเช็ค "WEBP" ที่ offset 8 ด้วย
  if (mime === "image/webp") {
    if (!startsWith(buf, spec.magic[0])) return false;
    if (buf.length < 12) return false;
    const webp = new Uint8Array([0x57, 0x45, 0x42, 0x50]); // "WEBP"
    return buf[8] === webp[0] && buf[9] === webp[1] && buf[10] === webp[2] && buf[11] === webp[3];
  }
  return spec.magic.some((m) => startsWith(buf, m));
}

export async function POST(req: NextRequest) {
  // ---- 1. admin-only ----
  const session = await getCurrentAdmin();
  if (!session?.adminId) {
    return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 });
  }

  // ---- 2. parse + size check ----
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "ไม่พบไฟล์" }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "ไฟล์ว่างเปล่า" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: `ไฟล์ใหญ่เกิน 5MB (ของคุณ ${(file.size / 1024 / 1024).toFixed(2)}MB)` }, { status: 413 });
  }

  // ---- 3. MIME + magic bytes validation ----
  const mime = file.type.toLowerCase();
  const spec = ALLOWED_MIME[mime];
  if (!spec) {
    return NextResponse.json({ error: "อนุญาตเฉพาะไฟล์ภาพ (jpg, png, webp, gif)" }, { status: 415 });
  }

  const bytes = await file.arrayBuffer();
  const header = new Uint8Array(bytes.slice(0, 16));
  if (!isValidMagic(header, mime)) {
    return NextResponse.json({ error: "ไฟล์ไม่ใช่ภาพจริง (magic bytes ไม่ตรง)" }, { status: 400 });
  }

  // ---- 4. generate safe filename ----
  const randomPart = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const fileName = `${randomPart}.${spec.ext}`;

  // ---- 5. Production: Vercel Blob ----
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`uploads/${fileName}`, file, {
      access: "public",
      contentType: mime,
      addRandomSuffix: false,
    });
    return NextResponse.json({ url: blob.url });
  }

  // ---- 6. Development: เซฟลง public/uploads ----
  const { writeFile, mkdir } = await import("fs/promises");
  const path = await import("path");
  const buffer = Buffer.from(bytes);
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, fileName), buffer);
  return NextResponse.json({ url: `/uploads/${fileName}` });
}
