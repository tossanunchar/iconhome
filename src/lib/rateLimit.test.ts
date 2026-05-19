import { describe, it, expect, beforeEach, vi } from "vitest";
import { rateLimit } from "./rateLimit";

describe("rateLimit", () => {
  // ใช้ key ใหม่ทุกเทสเพื่อกัน state leak ข้าม test
  let key = "";
  beforeEach(() => {
    key = `test-${Math.random()}`;
  });

  it("อนุญาตให้ผ่านในครั้งแรก", () => {
    const r = rateLimit(key, 3, 60_000);
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(2);
  });

  it("นับ remaining ถูกต้อง", () => {
    const a = rateLimit(key, 3, 60_000);
    const b = rateLimit(key, 3, 60_000);
    const c = rateLimit(key, 3, 60_000);
    expect(a.remaining).toBe(2);
    expect(b.remaining).toBe(1);
    expect(c.remaining).toBe(0);
  });

  it("บล็อกเมื่อเกิน limit", () => {
    rateLimit(key, 2, 60_000);
    rateLimit(key, 2, 60_000);
    const r = rateLimit(key, 2, 60_000);
    expect(r.allowed).toBe(false);
    expect(r.resetMs).toBeGreaterThan(0);
    expect(r.resetMs).toBeLessThanOrEqual(60_000);
  });

  it("รีเซ็ตหลัง window หมดอายุ", () => {
    vi.useFakeTimers();
    try {
      rateLimit(key, 2, 1000);
      rateLimit(key, 2, 1000);
      const blocked = rateLimit(key, 2, 1000);
      expect(blocked.allowed).toBe(false);

      // เลื่อนเวลาไปข้างหน้า > window
      vi.advanceTimersByTime(1100);

      const allowed = rateLimit(key, 2, 1000);
      expect(allowed.allowed).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it("แยก key ต่างกันไม่กระทบกัน", () => {
    const r1 = rateLimit(`${key}-a`, 1, 60_000);
    const r2 = rateLimit(`${key}-b`, 1, 60_000);
    expect(r1.allowed).toBe(true);
    expect(r2.allowed).toBe(true);
  });
});
