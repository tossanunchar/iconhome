"use client";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

// ---- Placeholder สำหรับสินค้าที่ไม่มีรูป ----
// ใช้ hash ของชื่อสินค้าเลือกสีจาก palette → สีคงที่ไม่กระพริบ
const PALETTE = [
  { bg: "from-red-100 to-red-50", text: "text-red-700" },
  { bg: "from-blue-100 to-blue-50", text: "text-blue-700" },
  { bg: "from-green-100 to-green-50", text: "text-green-700" },
  { bg: "from-purple-100 to-purple-50", text: "text-purple-700" },
  { bg: "from-amber-100 to-amber-50", text: "text-amber-700" },
  { bg: "from-cyan-100 to-cyan-50", text: "text-cyan-700" },
  { bg: "from-pink-100 to-pink-50", text: "text-pink-700" },
  { bg: "from-indigo-100 to-indigo-50", text: "text-indigo-700" },
  { bg: "from-teal-100 to-teal-50", text: "text-teal-700" },
  { bg: "from-orange-100 to-orange-50", text: "text-orange-700" },
];

function ProductPlaceholder({ name, brand, id }: { name: string; brand?: string | null; id: number }) {
  // เลือกสีจาก hash (deterministic) เพื่อให้แต่ละสินค้ามีสีของตัวเอง
  const idx = Math.abs(id * 2654435761) % PALETTE.length;
  const c = PALETTE[idx];

  // ใช้แบรนด์ก่อน ถ้าไม่มีค่อยใช้ตัวอักษรแรก 2 ตัวของชื่อ
  const label = brand || name.trim().slice(0, 2);

  return (
    <div className={`w-36 h-36 rounded bg-gradient-to-br ${c.bg} ${c.text} flex flex-col items-center justify-center relative overflow-hidden`}>
      {/* pattern พื้นหลังจางๆ */}
      <svg className="absolute inset-0 w-full h-full opacity-10" fill="none" stroke="currentColor" viewBox="0 0 100 100">
        <path d="M0 50 L50 0 L100 50 L50 100 Z" strokeWidth="1"/>
        <circle cx="50" cy="50" r="30" strokeWidth="1"/>
      </svg>
      <svg className="w-10 h-10 mb-1 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
      <span className="text-xs font-bold uppercase tracking-wide max-w-[7rem] truncate px-2 text-center">
        {label}
      </span>
    </div>
  );
}

interface ProductCardProps {
  id: number;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  images: string | string[];   // accepts JSON string or parsed array
  badge?: string | null;
  brand?: string | null;
  stock: number;
}

export default function ProductCard({ id, name, slug, price, originalPrice, images, badge, brand, stock }: ProductCardProps) {
  const { addItem } = useCart();

  // Parse images
  const imageArr: string[] = (() => {
    if (Array.isArray(images)) return images;
    try { return JSON.parse(images); } catch { return []; }
  })();
  const mainImage = imageArr[0] || null;

  const discount = originalPrice && originalPrice > price
    ? Math.round((1 - price / originalPrice) * 100)
    : null;

  const badgeStyle: Record<string, string> = {
    NEW: "bg-red-600 text-white",
    SALE: "bg-orange-500 text-white",
    HOT: "bg-red-600 text-white",
    BEST: "bg-blue-600 text-white",
  };

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id,
      name,
      slug,
      price,
      originalPrice,
      image: mainImage || undefined,
      brand,
    });
  }

  return (
    <div className="bg-white overflow-hidden hover:shadow-md transition-all duration-200 border border-gray-200 flex flex-col rounded">
      <Link href={`/product/${slug}`} className="block">
        <div className="relative bg-white flex items-center justify-center" style={{ height: "180px" }}>
          {badge && (
            <span className={`absolute top-2 left-2 ${badgeStyle[badge] || "bg-gray-600 text-white"} text-xs font-bold px-2 py-0.5 rounded z-10`}>
              {badge}
            </span>
          )}
          {stock === 0 && (
            <span className="absolute top-2 right-2 bg-gray-500 text-white text-xs font-bold px-2 py-0.5 rounded z-10">
              หมด
            </span>
          )}
          {mainImage ? (
            <Image
              src={mainImage}
              alt={name}
              width={144}
              height={144}
              className="w-36 h-36 object-contain"
            />
          ) : (
            <ProductPlaceholder name={name} brand={brand} id={id} />
          )}
        </div>
      </Link>

      {/* Shipping bar */}
      <div className="border-t border-gray-100 bg-gray-50 px-3 py-1.5 flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
        <span className="text-xs text-gray-600">สินค้าพร้อมส่ง</span>
      </div>

      <div className="p-3 flex flex-col flex-1">
        <div className="mb-2">
          <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded">
            ผ่อน 0%
          </span>
        </div>

        {brand && (
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">{brand}</span>
        )}
        <Link href={`/product/${slug}`}>
          <p className="text-sm text-gray-800 line-clamp-2 leading-snug min-h-[2.5rem] hover:text-red-600 transition-colors">
            {name}
          </p>
        </Link>

        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-2 flex-wrap mb-1">
            <span className="text-red-600 font-bold text-xl">
              ฿{price.toLocaleString()}
            </span>
          </div>
          {originalPrice && discount && discount > 0 && (
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-gray-400 text-xs line-through">
                ฿{originalPrice.toLocaleString()}
              </span>
              <span className="bg-red-600 text-white text-xs font-bold px-1 py-0.5 rounded">
                -{discount}%
              </span>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={stock === 0}
            className="w-full border border-gray-300 text-gray-600 text-sm py-2 rounded hover:border-red-500 hover:text-red-600 hover:bg-red-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {stock === 0 ? "สินค้าหมด" : "เพิ่มลงตะกร้า"}
          </button>
        </div>
      </div>
    </div>
  );
}
