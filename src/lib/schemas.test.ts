import { describe, it, expect } from "vitest";
import {
  productCreateSchema,
  orderCreateSchema,
  changePasswordSchema,
  registerSchema,
} from "./schemas";

describe("productCreateSchema", () => {
  it("ผ่านเมื่อข้อมูลครบถูกต้อง", () => {
    const r = productCreateSchema.safeParse({
      name: "สินค้าทดสอบ",
      price: 100,
      stock: 5,
      images: ["/uploads/abc.jpg"],
    });
    expect(r.success).toBe(true);
  });

  it("reject ราคาติดลบ", () => {
    const r = productCreateSchema.safeParse({ name: "X", price: -1 });
    expect(r.success).toBe(false);
  });

  it("reject ชื่อว่าง", () => {
    const r = productCreateSchema.safeParse({ name: "", price: 10 });
    expect(r.success).toBe(false);
  });

  it("reject badge ที่ไม่ใช่ enum", () => {
    const r = productCreateSchema.safeParse({ name: "X", price: 10, badge: "INVALID" });
    expect(r.success).toBe(false);
  });

  it("coerce string price → number", () => {
    const r = productCreateSchema.safeParse({ name: "X", price: "199.5" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.price).toBe(199.5);
  });
});

describe("orderCreateSchema", () => {
  it("ผ่านเมื่อมี items อย่างน้อย 1", () => {
    const r = orderCreateSchema.safeParse({
      items: [{ productId: 1, quantity: 2 }],
      guestName: "ทดสอบ",
      guestPhone: "0812345678",
    });
    expect(r.success).toBe(true);
  });

  it("reject ตะกร้าว่าง", () => {
    const r = orderCreateSchema.safeParse({ items: [] });
    expect(r.success).toBe(false);
  });

  it("reject quantity เกิน 999", () => {
    const r = orderCreateSchema.safeParse({
      items: [{ productId: 1, quantity: 1000 }],
    });
    expect(r.success).toBe(false);
  });

  it("reject productId ติดลบ", () => {
    const r = orderCreateSchema.safeParse({
      items: [{ productId: -1, quantity: 1 }],
    });
    expect(r.success).toBe(false);
  });

  it("ไม่รับ field price จาก client (ไม่อยู่ใน schema)", () => {
    // เผื่อ attacker แอบส่ง price มา — ต้องไม่ output ใน parsed.data
    const r = orderCreateSchema.safeParse({
      items: [{ productId: 1, quantity: 1, price: 0.01 }],
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect((r.data.items[0] as any).price).toBeUndefined();
    }
  });
});

describe("changePasswordSchema", () => {
  it("ผ่านเมื่อ valid", () => {
    const r = changePasswordSchema.safeParse({
      currentPassword: "old1234",
      newPassword: "newPass123",
      confirmPassword: "newPass123",
    });
    expect(r.success).toBe(true);
  });

  it("reject newPassword สั้นกว่า 8", () => {
    const r = changePasswordSchema.safeParse({
      currentPassword: "old1234",
      newPassword: "short",
      confirmPassword: "short",
    });
    expect(r.success).toBe(false);
  });

  it("reject newPassword ไม่มีตัวเลข", () => {
    const r = changePasswordSchema.safeParse({
      currentPassword: "old",
      newPassword: "OnlyLetters",
      confirmPassword: "OnlyLetters",
    });
    expect(r.success).toBe(false);
  });

  it("reject confirmPassword ไม่ตรง", () => {
    const r = changePasswordSchema.safeParse({
      currentPassword: "old",
      newPassword: "newPass123",
      confirmPassword: "different123",
    });
    expect(r.success).toBe(false);
  });

  it("reject newPassword ซ้ำกับ currentPassword", () => {
    const r = changePasswordSchema.safeParse({
      currentPassword: "samePass123",
      newPassword: "samePass123",
      confirmPassword: "samePass123",
    });
    expect(r.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("reject email format ผิด", () => {
    const r = registerSchema.safeParse({
      name: "ทดสอบ",
      email: "not-an-email",
      password: "password123",
    });
    expect(r.success).toBe(false);
  });

  it("ผ่านเมื่อข้อมูลครบ", () => {
    const r = registerSchema.safeParse({
      name: "ทดสอบ",
      email: "test@example.com",
      password: "password123",
    });
    expect(r.success).toBe(true);
  });
});
