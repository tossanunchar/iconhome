"use client";

import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const allBrands = ["LG", "Samsung", "Mitsubishi", "Daikin", "Hitachi", "Panasonic", "Carrier", "Toshiba", "Beko"];

const categories = [
  { label: "เครื่องปรับอากาศ", slug: "air-conditioner" },
  { label: "เครื่องซักผ้า", slug: "washing-machine" },
  { label: "ตู้เย็น", slug: "refrigerator" },
  { label: "โทรทัศน์", slug: "tv" },
  { label: "วัสดุก่อสร้าง", slug: "construction" },
  { label: "กระเบื้อง", slug: "tile" },
  { label: "สุขภัณฑ์", slug: "sanitary" },
  { label: "เหล็กเส้น", slug: "steel" },
];

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  images: string[];
  badge?: string | null;
  brand?: string | null;
  stock: number;
  category?: { name: string; slug: string } | null;
}

function CategoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read initial filter values from URL
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams.get("brand") ? [searchParams.get("brand")!] : []
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [badge, setBadge] = useState(searchParams.get("badge") || "");
  const [sortBy, setSortBy] = useState("newest");
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [page, setPage] = useState(1);

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const displayBrands = showAllBrands ? allBrands : allBrands.slice(0, 5);
  const totalPages = Math.ceil(total / 12);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedBrands.length === 1) params.set("brand", selectedBrands[0]);
    if (searchQuery) params.set("q", searchQuery);
    if (badge) params.set("badge", badge);
    if (sortBy) params.set("sort", sortBy);
    params.set("page", String(page));
    params.set("limit", "12");

    fetch(`/api/products?${params}`)
      .then(r => r.json())
      .then(d => {
        setProducts(d.products || []);
        setTotal(d.total || 0);
      })
      .finally(() => setLoading(false));
  }, [selectedCategory, selectedBrands, searchQuery, badge, sortBy, page]);

  function toggleBrand(b: string) {
    setPage(1);
    setSelectedBrands(prev =>
      prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]
    );
  }

  function clearFilters() {
    setSelectedCategory("");
    setSelectedBrands([]);
    setSearchQuery("");
    setBadge("");
    setSortBy("newest");
    setPage(1);
  }

  const activeFilters = [
    selectedCategory && { key: "category", label: categories.find(c => c.slug === selectedCategory)?.label || selectedCategory },
    ...selectedBrands.map(b => ({ key: `brand-${b}`, label: b })),
    searchQuery && { key: "q", label: `ค้นหา: ${searchQuery}` },
    badge && { key: "badge", label: badge },
  ].filter(Boolean) as { key: string; label: string }[];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-red-600">หน้าแรก</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">สินค้าทั้งหมด</span>
        </nav>

        <div className="flex gap-5">
          {/* Sidebar */}
          <aside className="w-56 flex-shrink-0">
            {/* Category filter */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <h3 className="font-bold text-sm text-gray-800 mb-3">หมวดหมู่</h3>
              <div className="space-y-1">
                <button
                  onClick={() => { setSelectedCategory(""); setPage(1); }}
                  className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${selectedCategory === "" ? "text-red-600 font-semibold bg-red-50" : "text-gray-700 hover:text-red-600"}`}
                >
                  ทั้งหมด
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.slug}
                    onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
                    className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${selectedCategory === cat.slug ? "text-red-600 font-semibold bg-red-50" : "text-gray-700 hover:text-red-600"}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand filter */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <h3 className="font-bold text-sm text-gray-800 mb-3">แบรนด์</h3>
              <div className="space-y-2">
                {displayBrands.map(brand => (
                  <label key={brand} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => toggleBrand(brand)}
                      className="accent-red-600 w-3.5 h-3.5"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-red-600 transition-colors">{brand}</span>
                  </label>
                ))}
              </div>
              {allBrands.length > 5 && (
                <button
                  onClick={() => setShowAllBrands(v => !v)}
                  className="mt-2 text-xs text-red-600 hover:underline font-medium"
                >
                  {showAllBrands ? "แสดงน้อยลง ∧" : `แสดงทั้งหมด (${allBrands.length}) ∨`}
                </button>
              )}
            </div>

            {/* Badge filter */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-bold text-sm text-gray-800 mb-3">ประเภท</h3>
              <div className="space-y-2">
                {[
                  { value: "", label: "ทั้งหมด" },
                  { value: "NEW", label: "สินค้าใหม่" },
                  { value: "SALE", label: "โปรโมชั่น" },
                  { value: "HOT", label: "ยอดนิยม" },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setBadge(opt.value); setPage(1); }}
                    className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${badge === opt.value ? "text-red-600 font-semibold bg-red-50" : "text-gray-700 hover:text-red-600"}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-sm text-gray-600">
                  {loading ? "กำลังโหลด..." : `พบ ${total} รายการ`}
                </p>
                {activeFilters.map(f => (
                  <span key={f.key} className="flex items-center gap-1 text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-1 rounded-full">
                    {f.label}
                    <button
                      onClick={() => {
                        if (f.key === "category") setSelectedCategory("");
                        else if (f.key.startsWith("brand-")) setSelectedBrands(prev => prev.filter(b => b !== f.label));
                        else if (f.key === "q") setSearchQuery("");
                        else if (f.key === "badge") setBadge("");
                        setPage(1);
                      }}
                      className="ml-1 hover:text-red-900 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {activeFilters.length > 0 && (
                  <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-gray-700 underline">
                    ล้างทั้งหมด
                  </button>
                )}
              </div>
              <select
                value={sortBy}
                onChange={e => { setSortBy(e.target.value); setPage(1); }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="newest">ใหม่สุด</option>
                <option value="price_asc">ราคา: ต่ำ → สูง</option>
                <option value="price_desc">ราคา: สูง → ต่ำ</option>
              </select>
            </div>

            {/* Products grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-xl h-72 animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 mb-4">ไม่พบสินค้าที่ตรงกับการค้นหา</p>
                <button onClick={clearFilters} className="text-red-600 hover:underline font-medium text-sm">
                  ล้างตัวกรอง
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                  {products.map(p => (
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white disabled:opacity-50 hover:bg-gray-50"
                    >
                      ← ก่อนหน้า
                    </button>
                    <span className="text-sm text-gray-600">หน้า {page} / {totalPages}</span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white disabled:opacity-50 hover:bg-gray-50"
                    >
                      ถัดไป →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">กำลังโหลด...</div>}>
      <CategoryContent />
    </Suspense>
  );
}
