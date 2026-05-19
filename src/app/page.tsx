export const dynamic = "force-dynamic";

import Link from "next/link";
import type { ReactNode } from "react";
import ProductCard from "@/components/ProductCard";
import HeroBanner from "@/components/HeroBanner";
import prisma from "@/lib/db";

// ---------- ไอคอน + สีพื้นหลัง map จาก category.slug ----------
// (slug ตรงกับ CATEGORY_MAP ใน prisma/import-products.ts)
const CATEGORY_THEME: Record<string, { bg: string; svg: ReactNode }> = {
  construction: {
    bg: "bg-orange-50",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9">
        <rect x="4" y="28" width="40" height="8" rx="2" fill="#FED7AA"/>
        <rect x="4" y="28" width="40" height="8" rx="2" stroke="#F97316" strokeWidth="2"/>
        <rect x="4" y="19" width="40" height="9" rx="1" fill="#FFEDD5" stroke="#F97316" strokeWidth="2"/>
        <rect x="4" y="10" width="40" height="9" rx="1" fill="#FFF7ED" stroke="#F97316" strokeWidth="2"/>
        <line x1="14" y1="10" x2="14" y2="36" stroke="#F97316" strokeWidth="1.5"/>
        <line x1="24" y1="10" x2="24" y2="36" stroke="#F97316" strokeWidth="1.5"/>
        <line x1="34" y1="10" x2="34" y2="36" stroke="#F97316" strokeWidth="1.5"/>
      </svg>
    ),
  },
  "door-window": {
    bg: "bg-amber-50",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9">
        <rect x="10" y="6" width="28" height="38" rx="1" fill="#FEF3C7"/>
        <rect x="10" y="6" width="28" height="38" rx="1" stroke="#D97706" strokeWidth="2"/>
        <rect x="14" y="10" width="20" height="30" rx="1" fill="#FFFBEB" stroke="#D97706" strokeWidth="1.5"/>
        <line x1="24" y1="10" x2="24" y2="40" stroke="#D97706" strokeWidth="1.5"/>
        <line x1="14" y1="25" x2="34" y2="25" stroke="#D97706" strokeWidth="1.5"/>
        <circle cx="30" cy="24" r="1.5" fill="#D97706"/>
      </svg>
    ),
  },
  tools: {
    bg: "bg-yellow-50",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9">
        <path d="M32 6 L42 16 L26 32 L16 22 Z" fill="#FEF3C7" stroke="#CA8A04" strokeWidth="2" strokeLinejoin="round"/>
        <rect x="3" y="32" width="16" height="6" rx="1" transform="rotate(-45 3 32)" fill="#FDE68A" stroke="#CA8A04" strokeWidth="2"/>
        <circle cx="36" cy="12" r="2" fill="#CA8A04"/>
      </svg>
    ),
  },
  electrical: {
    bg: "bg-yellow-50",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9">
        <path d="M26 4 L12 26 L22 26 L18 44 L36 22 L26 22 Z" fill="#FDE68A" stroke="#CA8A04" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
    ),
  },
  "tile-sanitary": {
    bg: "bg-teal-50",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9">
        <rect x="4" y="4" width="18" height="18" rx="2" fill="#CCFBF1"/>
        <rect x="4" y="4" width="18" height="18" rx="2" stroke="#14B8A6" strokeWidth="2"/>
        <rect x="26" y="4" width="18" height="18" rx="2" fill="#CCFBF1" opacity="0.7"/>
        <rect x="26" y="4" width="18" height="18" rx="2" stroke="#14B8A6" strokeWidth="2"/>
        <rect x="4" y="26" width="18" height="18" rx="2" fill="#CCFBF1" opacity="0.7"/>
        <rect x="4" y="26" width="18" height="18" rx="2" stroke="#14B8A6" strokeWidth="2"/>
        <rect x="26" y="26" width="18" height="18" rx="2" fill="#CCFBF1"/>
        <rect x="26" y="26" width="18" height="18" rx="2" stroke="#14B8A6" strokeWidth="2"/>
      </svg>
    ),
  },
  paint: {
    bg: "bg-pink-50",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9">
        <rect x="10" y="14" width="22" height="28" rx="2" fill="#FCE7F3" stroke="#EC4899" strokeWidth="2"/>
        <rect x="14" y="8" width="14" height="8" rx="1" fill="#FBCFE8" stroke="#EC4899" strokeWidth="2"/>
        <path d="M32 20 Q40 20 40 26 Q40 32 32 32" stroke="#EC4899" strokeWidth="2" fill="none"/>
        <line x1="14" y1="22" x2="28" y2="22" stroke="#EC4899" strokeWidth="1.5"/>
        <line x1="14" y1="28" x2="28" y2="28" stroke="#EC4899" strokeWidth="1.5"/>
      </svg>
    ),
  },
  plumbing: {
    bg: "bg-sky-50",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9">
        <path d="M24 4 C16 16 12 22 12 30 a12 12 0 1 0 24 0 c0 -8 -4 -14 -12 -26 Z" fill="#E0F2FE" stroke="#0EA5E9" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M19 30 a5 5 0 0 0 10 0" stroke="#0EA5E9" strokeWidth="1.5" fill="none"/>
      </svg>
    ),
  },
  furniture: {
    bg: "bg-amber-50",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9">
        <rect x="6" y="22" width="36" height="14" rx="3" fill="#FEF3C7" stroke="#D97706" strokeWidth="2"/>
        <rect x="6" y="14" width="36" height="10" rx="2" fill="#FDE68A" stroke="#D97706" strokeWidth="2"/>
        <line x1="10" y1="36" x2="10" y2="42" stroke="#D97706" strokeWidth="2" strokeLinecap="round"/>
        <line x1="38" y1="36" x2="38" y2="42" stroke="#D97706" strokeWidth="2" strokeLinecap="round"/>
        <line x1="6" y1="28" x2="42" y2="28" stroke="#D97706" strokeWidth="1.5"/>
      </svg>
    ),
  },
  appliance: {
    bg: "bg-cyan-50",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9">
        <rect x="6" y="4" width="36" height="40" rx="4" fill="#CFFAFE" stroke="#06B6D4" strokeWidth="2"/>
        <circle cx="24" cy="27" r="11" stroke="#06B6D4" strokeWidth="2"/>
        <circle cx="24" cy="27" r="5" fill="#CFFAFE" stroke="#06B6D4" strokeWidth="1.5"/>
        <rect x="10" y="10" width="5" height="3" rx="1" fill="#06B6D4"/>
        <circle cx="32" cy="11.5" r="2" fill="#06B6D4"/>
      </svg>
    ),
  },
  household: {
    bg: "bg-red-50",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9">
        <path d="M6 22 L24 6 L42 22 V40 a2 2 0 0 1 -2 2 H8 a2 2 0 0 1 -2 -2 Z" fill="#FEE2E2" stroke="#EF4444" strokeWidth="2" strokeLinejoin="round"/>
        <rect x="20" y="26" width="8" height="16" fill="#FECACA" stroke="#EF4444" strokeWidth="1.5"/>
      </svg>
    ),
  },
  foam: {
    bg: "bg-indigo-50",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9">
        <rect x="6" y="14" width="36" height="22" rx="3" fill="#E0E7FF" stroke="#6366F1" strokeWidth="2"/>
        <circle cx="14" cy="22" r="3" fill="#C7D2FE" stroke="#6366F1" strokeWidth="1.5"/>
        <circle cx="24" cy="28" r="3" fill="#C7D2FE" stroke="#6366F1" strokeWidth="1.5"/>
        <circle cx="34" cy="22" r="3" fill="#C7D2FE" stroke="#6366F1" strokeWidth="1.5"/>
        <circle cx="18" cy="30" r="2" fill="#C7D2FE" stroke="#6366F1" strokeWidth="1.5"/>
        <circle cx="30" cy="30" r="2" fill="#C7D2FE" stroke="#6366F1" strokeWidth="1.5"/>
      </svg>
    ),
  },
  services: {
    bg: "bg-purple-50",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9">
        <circle cx="24" cy="24" r="18" fill="#EDE9FE" stroke="#8B5CF6" strokeWidth="2"/>
        <path d="M24 14 v10 l7 4" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      </svg>
    ),
  },
  office: {
    bg: "bg-blue-50",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9">
        <rect x="10" y="6" width="24" height="36" rx="2" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="2"/>
        <rect x="16" y="2" width="12" height="6" rx="1" fill="#3B82F6"/>
        <line x1="14" y1="16" x2="30" y2="16" stroke="#3B82F6" strokeWidth="1.5"/>
        <line x1="14" y1="22" x2="30" y2="22" stroke="#3B82F6" strokeWidth="1.5"/>
        <line x1="14" y1="28" x2="24" y2="28" stroke="#3B82F6" strokeWidth="1.5"/>
      </svg>
    ),
  },
  solar: {
    bg: "bg-green-50",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9">
        <rect x="6" y="10" width="36" height="22" rx="2" fill="#D1FAE5" stroke="#10B981" strokeWidth="2"/>
        <line x1="6" y1="21" x2="42" y2="21" stroke="#10B981" strokeWidth="1.5"/>
        <line x1="18" y1="10" x2="18" y2="32" stroke="#10B981" strokeWidth="1.5"/>
        <line x1="30" y1="10" x2="30" y2="32" stroke="#10B981" strokeWidth="1.5"/>
        <circle cx="24" cy="40" r="3" fill="#FDE047" stroke="#EAB308" strokeWidth="1.5"/>
        <line x1="24" y1="32" x2="24" y2="36" stroke="#EAB308" strokeWidth="1.5"/>
      </svg>
    ),
  },
};

const DEFAULT_THEME = {
  bg: "bg-gray-100",
  svg: (
    <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9">
      <rect x="6" y="6" width="36" height="36" rx="6" fill="#F3F4F6" stroke="#9CA3AF" strokeWidth="2"/>
      <circle cx="24" cy="20" r="6" fill="#E5E7EB" stroke="#6B7280" strokeWidth="1.5"/>
      <rect x="14" y="28" width="20" height="10" rx="2" fill="#E5E7EB" stroke="#6B7280" strokeWidth="1.5"/>
    </svg>
  ),
};

// ---------- โทนสีตัวอักษรของแบรนด์ (วนใช้ตามลำดับ) ----------
const BRAND_COLORS = [
  "text-red-600",
  "text-blue-800",
  "text-emerald-700",
  "text-orange-700",
  "text-purple-700",
  "text-cyan-700",
  "text-amber-700",
  "text-gray-800",
];

async function getHomeData() {
  const [
    newProducts,
    saleProducts,
    categories,
    brandRows,
    productCount,
  ] = await Promise.all([
    prisma.product.findMany({
      where: { badge: "NEW" },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.product.findMany({
      where: { badge: "SALE" },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
    // top 8 แบรนด์ตามจำนวนสินค้า
    prisma.$queryRaw<Array<{ brand: string; cnt: bigint }>>`
      SELECT brand, COUNT(*) AS cnt
      FROM "Product"
      WHERE brand IS NOT NULL
      GROUP BY brand
      ORDER BY cnt DESC
      LIMIT 8
    `,
    prisma.product.count(),
  ]);

  // ถ้ายังไม่มีสินค้า NEW/SALE ใช้สินค้าล่าสุด/ราคาต่ำสุดแทนเพื่อไม่ให้หน้าว่าง
  let displayNew = newProducts;
  let displaySale = saleProducts;
  if (displayNew.length === 0) {
    displayNew = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
    });
  }
  if (displaySale.length === 0) {
    displaySale = await prisma.product.findMany({
      where: { price: { gt: 0 } },
      orderBy: { price: "asc" },
      take: 4,
    });
  }

  return {
    newProducts: displayNew,
    saleProducts: displaySale,
    categories,
    brands: brandRows.map((b) => b.brand),
    productCount,
  };
}

function parseImages(raw: string): string[] {
  try { return JSON.parse(raw); } catch { return []; }
}

function formatStat(n: number): string {
  if (n >= 1000) return `${Math.floor(n / 1000)}K+`;
  if (n >= 100) return `${Math.floor(n / 100) * 100}+`;
  return `${n}`;
}

export default async function HomePage() {
  const { newProducts, saleProducts, categories, brands, productCount } = await getHomeData();

  return (
    <div>
      {/* Hero Banner — dynamic from DB, falls back to static if none uploaded */}
      <HeroBanner fallback={
        <section className="relative overflow-hidden" style={{ background: "#E30613", minHeight: "260px" }}>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute right-0 top-0 bottom-0 w-64"
              style={{ background: "linear-gradient(135deg, transparent 0%, rgba(255,200,0,0.15) 100%)" }} />
            <div className="absolute -left-10 -top-10 w-80 h-80 rounded-full bg-white opacity-5" />
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-52 flex flex-col items-center justify-center"
            style={{ background: "linear-gradient(180deg, #FFD600 0%, #FFC300 100%)" }}>
            <div className="text-center px-3">
              <p className="text-red-700 font-black text-sm leading-tight">สินค้าโครงสร้าง</p>
              <p className="text-red-800 font-bold text-xs mt-1">วันนี้ - 30 มิ.ย. 69</p>
              <div className="mt-3 border-t-2 border-red-600/30 pt-2">
                <p className="text-red-700 font-black text-2xl leading-none">สรีไท</p>
                <p className="text-red-600 text-xs font-semibold">ทุกรุ่น ทุกขนาด</p>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 py-6 relative" style={{ marginRight: "13rem" }}>
            <div className="flex items-center gap-8">
              <div className="text-white">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-yellow-400 text-red-800 text-xs font-black px-2.5 py-0.5 rounded uppercase tracking-wide">โปรโมชั่น</span>
                  <span className="text-white/80 text-sm">วันนี้ - 30 มิ.ย. 69</span>
                </div>
                <div className="text-6xl font-black leading-none mb-1" style={{ textShadow: "3px 3px 0 rgba(0,0,0,0.2)" }}>
                  ทุบราคา
                </div>
                <div className="text-xl font-bold text-yellow-300 mb-4">สินค้าโครงสร้าง</div>
                <Link href="/category?badge=SALE" className="inline-flex items-center gap-2 bg-white text-red-600 font-bold px-5 py-2 rounded hover:bg-yellow-300 hover:text-red-700 transition-colors text-sm shadow">
                  ดูโปรโมชั่นทั้งหมด
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-52 bg-black/20 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-4">
              {[
                { label: "อิฐบล็อก", price: "5.5", unit: "บาท/ก้อน" },
                { label: "เหล็กเส้น", price: "26", unit: "บาท/เส้น" },
                { label: "กระเบื้อง", price: "109", unit: "บาท/แผ่น" },
                { label: "ปูนซีเมนต์", price: "22", unit: "บาท/ถุง" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-white">
                  <div className="text-center">
                    <span className="text-white/80 text-xs">{item.label} </span>
                    <span className="text-yellow-300 font-black text-lg">{item.price}</span>
                    <span className="text-white/70 text-xs"> {item.unit}</span>
                  </div>
                  <span className="text-white/30 text-lg">|</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      } />

      {/* Category section — มาจากฐานข้อมูลจริง */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span className="w-1 h-5 bg-red-600 rounded-full inline-block"></span>
            หมวดหมู่สินค้า
          </h2>
          <Link href="/category" className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-0.5">
            ดูทั้งหมด
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
          {categories.map((cat) => {
            const theme = CATEGORY_THEME[cat.slug] ?? DEFAULT_THEME;
            return (
              <Link key={cat.id} href={`/category?category=${cat.slug}`}
                className={`flex flex-col items-center gap-2 py-4 px-2 ${theme.bg} rounded-lg hover:shadow-sm transition-all group text-center border border-transparent hover:border-gray-200`}
              >
                <div className="w-11 h-11 flex items-center justify-center">
                  {theme.svg}
                </div>
                <span className="text-xs font-medium text-gray-700 group-hover:text-red-600 transition-colors leading-tight">{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Brand section — top 8 แบรนด์ที่มีสินค้ามากที่สุด */}
      {brands.length > 0 && (
        <section className="border-t border-b border-gray-100 bg-gray-50 py-5">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="w-1 h-5 bg-red-600 rounded-full inline-block"></span>
                สินค้าตามแบรนด์
              </h2>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {brands.map((brand, i) => (
                <Link key={brand} href={`/category?brand=${encodeURIComponent(brand)}`}
                  className="bg-white rounded border border-gray-200 px-3 py-4 flex flex-col items-center gap-2 hover:border-red-300 hover:shadow-sm transition-all group"
                >
                  <div className="w-full h-8 flex items-center justify-center">
                    <span className={`text-sm font-black ${BRAND_COLORS[i % BRAND_COLORS.length]} truncate text-center`} title={brand}>
                      {brand}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New products */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-1 h-5 bg-red-600 rounded-full inline-block"></span>
            <h2 className="text-lg font-bold text-gray-800">สินค้ามาใหม่</h2>
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded">NEW</span>
          </div>
          <Link href="/category?sort=newest" className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-0.5">
            ดูทั้งหมด
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {newProducts.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              slug={p.slug}
              price={p.price}
              originalPrice={p.originalPrice}
              images={parseImages(p.images)}
              badge={p.badge}
              brand={p.brand}
              stock={p.stock}
            />
          ))}
          {newProducts.length === 0 && (
            <p className="col-span-4 text-center text-gray-400 py-8">ยังไม่มีสินค้า</p>
          )}
        </div>
      </section>

      {/* Sale products */}
      <section className="bg-gray-50 border-t border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-1 h-5 bg-red-600 rounded-full inline-block"></span>
              <h2 className="text-lg font-bold text-gray-800">โปรโมชั่นทุกราคา</h2>
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">HOT</span>
            </div>
            <Link href="/category?sort=price-asc" className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-0.5">
              ดูทั้งหมด
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {saleProducts.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                slug={p.slug}
                price={p.price}
                originalPrice={p.originalPrice}
                images={parseImages(p.images)}
                badge={p.badge}
                brand={p.brand}
                stock={p.stock}
              />
            ))}
            {saleProducts.length === 0 && (
              <p className="col-span-4 text-center text-gray-400 py-8">ยังไม่มีสินค้า</p>
            )}
          </div>
        </div>
      </section>

      {/* About store banner */}
      <section className="bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="text-white flex-1">
              <h2 className="text-2xl font-bold mb-2">
                <span className="text-red-500">ไอคอนโฮม</span>
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                จำหน่ายวัสดุก่อสร้าง : สุขภัณฑ์ กระเบื้องปูพื้น/ผนัง ไม้ฝา เครื่องใช้ไฟฟ้า เหล็กเส้น สรีไท พัดลมไม้
                ราคาส่งตรงจากโรงงาน เปิดให้บริการทุกวัน 08.00 - 18.00 น.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-6 text-center flex-shrink-0">
              {[
                { number: "10+", label: "ปีประสบการณ์" },
                { number: formatStat(productCount), label: "รายการสินค้า" },
                { number: "2", label: "สาขา" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl font-black text-yellow-400">{stat.number}</div>
                  <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
