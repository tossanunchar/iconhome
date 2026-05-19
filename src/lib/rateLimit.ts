// Rate limiter — sliding window แบบ in-memory
// หมายเหตุ: ใน serverless แต่ละ Lambda instance มี state ของตัวเอง
// แต่ก็ยังช่วย slow down brute-force ได้ + bcrypt cost 12 (~250ms ต่อ check)
// ทำให้ attacker ทำได้ ~240 attempts/min/instance — ในทางปฏิบัติพอใช้สำหรับ scale ปัจจุบัน
// ถ้าต้องการ rate limit แบบ distributed ให้ติดตั้ง Upstash Redis แล้วเปลี่ยนเป็น @upstash/ratelimit

type Entry = {
  timestamps: number[]; // unix ms ของแต่ละ hit
};

const BUCKETS: Map<string, Entry> = new Map();
const MAX_KEYS = 10_000;

// ทุก 5 นาที sweep entries ที่หมดอายุออก ป้องกัน memory leak
let lastSweep = Date.now();

function sweep(now: number, maxAgeMs: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, e] of BUCKETS.entries()) {
    e.timestamps = e.timestamps.filter((t) => now - t < maxAgeMs);
    if (e.timestamps.length === 0) BUCKETS.delete(key);
  }
  // กัน OOM
  if (BUCKETS.size > MAX_KEYS) {
    const overflow = BUCKETS.size - MAX_KEYS;
    let i = 0;
    for (const key of BUCKETS.keys()) {
      if (i++ >= overflow) break;
      BUCKETS.delete(key);
    }
  }
}

/**
 * ตรวจว่า key ถูกเรียกเกิน maxRequests ครั้ง ภายใน windowMs หรือไม่
 * @returns { allowed: boolean; remaining: number; resetMs: number }
 */
export function rateLimit(key: string, maxRequests: number, windowMs: number) {
  const now = Date.now();
  sweep(now, windowMs);

  let entry = BUCKETS.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    BUCKETS.set(key, entry);
  }

  // ตัด timestamp ที่นอก window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= maxRequests) {
    const oldest = entry.timestamps[0];
    const resetMs = windowMs - (now - oldest);
    return { allowed: false, remaining: 0, resetMs };
  }

  entry.timestamps.push(now);
  return { allowed: true, remaining: maxRequests - entry.timestamps.length, resetMs: 0 };
}

/**
 * ดึง client IP จาก request headers (Vercel/Cloudflare)
 * Fallback: "unknown"
 */
export function getClientIP(req: Request): string {
  const h = req.headers;
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    h.get("cf-connecting-ip") ||
    "unknown"
  );
}
