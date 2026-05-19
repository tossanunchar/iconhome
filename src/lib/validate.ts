// Helper: validate JSON body ของ NextRequest ด้วย Zod schema
// ใช้แบบ:
//   const parsed = await validateBody(req, productCreateSchema);
//   if (!parsed.ok) return parsed.response;
//   const data = parsed.data;

import { NextRequest, NextResponse } from "next/server";
import type { ZodType } from "zod";

type Result<T> =
  | { ok: true; data: T }
  | { ok: false; response: NextResponse };

export async function validateBody<T>(
  req: NextRequest,
  schema: ZodType<T>
): Promise<Result<T>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "ข้อมูลไม่ใช่ JSON ที่ถูกต้อง" }, { status: 400 }),
    };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    // เอา error แรกเป็น message หลัก
    const first = result.error.issues[0];
    const path = first?.path?.join(".") || "input";
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: first?.message || "ข้อมูลไม่ถูกต้อง",
          field: path,
          issues: result.error.issues.map((i) => ({ path: i.path, message: i.message })),
        },
        { status: 400 }
      ),
    };
  }

  return { ok: true, data: result.data };
}
