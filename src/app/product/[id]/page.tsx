"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";

interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  originalPrice?: number | null;
  images: string[];
  badge?: string | null;
  brand?: string | null;
  stock: number;
  category?: { name: string; slug: string } | null;
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.id as string; // route is /product/[id] but we use slug
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"detail" | "spec">("detail");
  const [qty, setQty] = useState(1);
  const [selectedImg, setSelectedImg] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    // Fetch product by slug
    fetch(`/api/products?slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(async d => {
        const products = d.products || [];
        const found = products[0] || null;
        setProduct(found);
        if (found?.category?.slug) {
          const rel = await fetch(`/api/products?category=${found.category.slug}&limit=5`)
            .then(r => r.json())
            .then(d => (d.products || []).filter((p: Product) => p.id !== found.id).slice(0, 4));
          setRelated(rel);
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  function handleAddToCart() {
    if (!product) return;
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.images[0] || undefined,
      brand: product.brand,
    }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-64 mb-6" />
          <div className="flex gap-8">
            <div className="w-2/5 aspect-square bg-gray-200 rounded" />
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-10 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">ไม่พบสินค้า</h1>
        <Link href="/category" className="text-red-600 hover:underline">ดูสินค้าทั้งหมด</Link>
      </div>
    );
  }

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-red-600">หน้าแรก</Link>
        <span className="mx-2">/</span>
        {product.category && (
          <>
            <Link href={`/category?category=${product.category.slug}`} className="hover:text-red-600">
              {product.category.name}
            </Link>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-gray-800 font-medium line-clamp-1">{product.name}</span>
      </nav>

      {/* Product main */}
      <div className="bg-white border border-gray-200 rounded p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Image gallery */}
          <div className="md:w-2/5">
            <div className="border border-gray-200 rounded p-4 flex items-center justify-center bg-gray-50 aspect-square mb-3 relative">
              {product.badge && (
                <span className={`absolute top-3 left-3 text-xs font-bold px-2 py-0.5 rounded z-10 ${product.badge === "NEW" ? "bg-blue-600 text-white" : product.badge === "SALE" ? "bg-red-600 text-white" : "bg-orange-500 text-white"}`}>
                  {product.badge}
                </span>
              )}
              {product.images[selectedImg] ? (
                <Image
                  src={product.images[selectedImg]}
                  alt={product.name}
                  width={320}
                  height={320}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-200">
                  <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(i)}
                    className={`border-2 rounded p-1 w-16 h-16 flex items-center justify-center bg-gray-50 transition-colors ${selectedImg === i ? "border-red-500" : "border-gray-200 hover:border-gray-400"}`}
                  >
                    <Image src={img} alt="" width={56} height={56} className="max-w-full max-h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="md:w-3/5">
            {product.brand && (
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{product.brand}</span>
            )}
            <h1 className="text-xl font-bold text-gray-800 mt-1 mb-2">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-end gap-3 mb-4">
              <span className="text-3xl font-black text-red-600">฿{product.price.toLocaleString()}</span>
              {product.originalPrice && discount && (
                <>
                  <span className="text-lg text-gray-400 line-through mb-0.5">฿{product.originalPrice.toLocaleString()}</span>
                  <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded mb-0.5">ลด {discount}%</span>
                </>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-4">
              {product.stock > 0 ? (
                <>
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm text-green-600 font-medium">มีสินค้าในคลัง ({product.stock} ชิ้น)</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span className="text-sm text-red-600 font-medium">สินค้าหมด</span>
                </>
              )}
            </div>

            {/* Payment methods */}
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              <span className="text-sm text-gray-600">ชำระด้วย:</span>
              {["ธนาคาร", "บัตรเครดิต", "พร้อมเพย์", "QR Code"].map((method) => (
                <span key={method} className="text-xs border border-gray-300 rounded px-2 py-1 text-gray-600">{method}</span>
              ))}
            </div>

            {/* Qty */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-sm text-gray-600">จำนวน:</span>
              <div className="flex items-center border border-gray-300 rounded">
                <button onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 transition-colors text-lg font-bold text-gray-600">
                  −
                </button>
                <span className="w-12 text-center text-sm font-medium">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 transition-colors text-lg font-bold text-gray-600">
                  +
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mb-5">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 font-semibold py-3 rounded transition-colors flex items-center justify-center gap-2 ${added ? "bg-green-600 text-white" : "bg-red-600 hover:bg-red-700 text-white"} disabled:bg-gray-300 disabled:cursor-not-allowed`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {added ? "เพิ่มแล้ว ✓" : product.stock === 0 ? "สินค้าหมด" : "เพิ่มลงตะกร้า"}
              </button>
              <Link
                href="/cart"
                className="flex-1 border-2 border-red-600 text-red-600 hover:bg-red-50 font-semibold py-3 rounded transition-colors text-center"
              >
                ดูตะกร้า
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Description tabs */}
      <div className="bg-white border border-gray-200 rounded mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("detail")}
            className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === "detail" ? "border-b-2 border-red-600 text-red-600" : "text-gray-600 hover:text-gray-800"}`}
          >
            รายละเอียด
          </button>
          <button
            onClick={() => setActiveTab("spec")}
            className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === "spec" ? "border-b-2 border-red-600 text-red-600" : "text-gray-600 hover:text-gray-800"}`}
          >
            ข้อมูลเพิ่มเติม
          </button>
        </div>
        <div className="p-6 text-sm text-gray-600 leading-relaxed">
          {activeTab === "detail" ? (
            <div className="whitespace-pre-line">{product.description || "ไม่มีรายละเอียด"}</div>
          ) : (
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                {[
                  ["ชื่อสินค้า", product.name],
                  product.brand && ["แบรนด์", product.brand],
                  product.category && ["หมวดหมู่", product.category.name],
                  ["ราคา", `฿${product.price.toLocaleString()}`],
                  ["สต็อก", `${product.stock} ชิ้น`],
                ].filter(Boolean).map((row: any) => (
                  <tr key={row[0]}>
                    <td className="py-2 pr-4 font-medium text-gray-700 w-1/3">{row[0]}</td>
                    <td className="py-2 text-gray-600">{row[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 border-l-4 border-red-600 pl-3 mb-4">สินค้าที่เกี่ยวข้อง</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                slug={p.slug}
                price={p.price}
                originalPrice={p.originalPrice}
                images={p.images}
                badge={p.badge}
                brand={p.brand}
                stock={p.stock}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
