// รวม Zod schemas ทั้งหมดสำหรับ validate API input
// ใช้คู่กับ helper validateBody() ใน src/lib/validate.ts

import { z } from "zod";

// ---- shared primitives ----
const positiveInt = z.coerce.number().int().positive();
const nonNegativeNumber = z.coerce.number().nonnegative();
const optionalString = z.string().trim().max(2000).optional().or(z.literal("").transform(() => undefined));

// ---- Product ----
export const productCreateSchema = z.object({
  name: z.string().trim().min(1, "กรุณากรอกชื่อสินค้า").max(255),
  description: optionalString,
  price: nonNegativeNumber,
  originalPrice: nonNegativeNumber.optional().nullable(),
  stock: z.coerce.number().int().nonnegative().default(0),
  images: z.array(z.string().url().or(z.string().startsWith("/"))).max(20).optional().default([]),
  badge: z.enum(["NEW", "SALE", "HOT"]).optional().nullable(),
  brand: z.string().trim().max(100).optional().nullable(),
  categoryId: positiveInt.optional().nullable(),
});

export const productUpdateSchema = productCreateSchema.partial().extend({
  name: z.string().trim().min(1).max(255),
  price: nonNegativeNumber,
});

// ---- Order ----
const orderItemInputSchema = z.object({
  productId: positiveInt,
  quantity: z.coerce.number().int().min(1).max(999),
});

export const orderCreateSchema = z.object({
  items: z.array(orderItemInputSchema).min(1, "ตะกร้าว่าง").max(100),
  guestName: z.string().trim().max(200).optional().nullable(),
  guestPhone: z.string().trim().max(20).optional().nullable(),
  guestEmail: z.string().email().max(200).optional().nullable().or(z.literal("").transform(() => null)),
  address: z.string().trim().max(1000).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
  // เผื่อ legacy keys (ตามที่ checkout เก่าส่งมา)
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
});

export const orderUpdateSchema = z.object({
  status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]).optional(),
  notes: z.string().trim().max(2000).optional().nullable(),
});

// ---- Auth ----
export const loginSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(1).max(200),
});

export const registerSchema = z.object({
  name: z.string().trim().min(1, "กรุณากรอกชื่อ").max(200),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง").max(200),
  password: z.string().min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร").max(200),
  phone: z.string().trim().max(20).optional().nullable(),
});

export const adminLoginSchema = z.object({
  username: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(200),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(8, "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร").max(100)
    .regex(/[A-Za-z]/, "ต้องมีตัวอักษร")
    .regex(/[0-9]/, "ต้องมีตัวเลข"),
  confirmPassword: z.string().min(1),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "ยืนยันรหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"],
}).refine((d) => d.currentPassword !== d.newPassword, {
  message: "รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสเดิม",
  path: ["newPassword"],
});

// ---- Banner ----
export const bannerSchema = z.object({
  title: z.string().trim().max(200).optional().nullable(),
  imageUrl: z.string().url().or(z.string().startsWith("/")),
  linkUrl: z.string().url().or(z.string().startsWith("/")).optional().nullable()
    .or(z.literal("").transform(() => null)),
  position: z.coerce.number().int().min(0).max(99).default(0),
  isActive: z.coerce.boolean().default(true),
});
