"use client";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

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
            <div className="w-36 h-36 flex items-center justify-center text-gray-200">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
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
