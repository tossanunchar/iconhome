"use client";

import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type Category = { id: number; name: string; slug: string };

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

  // ---- filter state ----
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams.get("brand") ? [searchParams.get("brand")!] : []
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [badge, setBadge] = useState(searchParams.get("badge") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [page, setPage] = useState(1);

  // ---- data ----
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  const displayBrands = showAllBrands ? brands : brands.slice(0, 8);
  const totalPages = Math.ceil(total / 12);

  // ---- fetch categories + brands once ----
  useEffect(() => {
    fetch("/api/site/config")
      .then((r) => r.json())
      .then((d) => {
        setCategories(d.categories || []);
        setBrands(d.brands || []);
      })
      .catch(() => {});
  }, []);

  // ---- fetch products ----
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedBrands.length === 1) params.set("brand", selectedBrands[0]);
    if (searchQuery) params.set("q", searchQuery);
    if (badge) params.set("badge", badge);
    if (sortBy) params.set("sort", sortBy);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    params.set("page", String(page));
    params.set("limit", "12");

    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setProducts(d.products || []);
        setTotal(d.total || 0);
      })
      .finally(() => setLoading(false));
  }, [selectedCategory, selectedBrands, searchQuery, badge, sortBy, minPrice, maxPrice, page]);

  function toggleBrand(b: string) {
    setPage(1);
    setSelectedBrands((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]));
  }

  function clearFilters() {
    setSelectedCategory("");
    setSelectedBrands([]);
    setSearchQuery("");
    setBadge("");
    setSortBy("newest");
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
  }

  const activeFilters = [
    selectedCategory && { key: "category", label: categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory },
    ...selectedBrands.map((b) => ({ key: `brand-${b}`, label: b })),
    searchQuery && { key: "q", label: `ค้นหา: ${searchQuery}` },
    badge && { key: "badge", label: badge },
    (minPrice || maxPrice) && { key: "price", label: `฿${minPrice || "0"}–${maxPrice || "∞"}` },
  ].filter(Boolean) as { key: string; label: string }[];

  function removeFilter(key: string, label?: string) {
    if (key === "category") setSelectedCategory("");
    else if (key.startsWith("brand-")) setSelectedBrands((prev) => prev.filter((b) => b !== label));
    else if (key === "q") setSearchQuery("");
    else if (key === "badge") setBadge("");
    else if (key === "price") { setMinPrice(""); setMaxPrice(""); }
    setPage(1);
  }

  // ---- Filter Sidebar (shared between desktop + mobile drawer) ----
  function FilterContent() {
    return (
      <>
        {/* Category */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <h3 className="font-bold text-sm text-gray-800 mb-3">หมวดหมู่</h3>
          <div className="space-y-1">
            <button
              onClick={() => { setSelectedCategory(""); setPage(1); }}
              className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${selectedCategory === "" ? "text-red-600 font-semibold bg-red-50" : "text-gray-700 hover:text-red-600"}`}
            >
              ทั้งหมด
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
                className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${selectedCategory === cat.slug ? "text-red-600 font-semibold bg-red-50" : "text-gray-700 hover:text-red-600"}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Price range */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <h3 className="font-bold text-sm text-gray-800 mb-3">ช่วงราคา</h3>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="number"
              placeholder="ต่ำสุด"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <span className="text-gray-400 text-xs">–</span>
            <input
              type="number"
              placeholder="สูงสุด"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { min: "", max: "500", label: "< 500" },
              { min: "500", max: "2000", label: "500–2K" },
              { min: "2000", max: "10000", label: "2K–10K" },
              { min: "10000", max: "", label: "> 10K" },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => { setMinPrice(preset.min); setMaxPrice(preset.max); setPage(1); }}
                className="text-xs border border-gray-300 hover:border-red-500 hover:text-red-600 rounded-full px-2 py-0.5 transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage(1)}
            className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-1.5 rounded"
          >
            ใช้ช่วงราคา
          </button>
        </div>

        {/* Brand */}
        {brands.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <h3 className="font-bold text-sm text-gray-800 mb-3">แบรนด์</h3>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {displayBrands.map((b) => (
                <label key={b} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(b)}
                    onChange={() => toggleBrand(b)}
                    className="accent-red-600 w-3.5 h-3.5"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-red-600 transition-colors truncate">{b}</span>
                </label>
              ))}
            </div>
            {brands.length > 8 && (
              <button
                onClick={() => setShowAllBrands((v) => !v)}
                className="mt-2 text-xs text-red-600 hover:underline font-medium"
              >
                {showAllBrands ? "แสดงน้อยลง ∧" : `แสดงทั้งหมด (${brands.length}) ∨`}
              </button>
            )}
          </div>
        )}

        {/* Badge */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-bold text-sm text-gray-800 mb-3">ประเภท</h3>
          <div className="space-y-2">
            {[
              { value: "", label: "ทั้งหมด" },
              { value: "NEW", label: "สินค้าใหม่" },
              { value: "SALE", label: "โปรโมชั่น" },
              { value: "HOT", label: "ยอดนิยม" },
            ].map((opt) => (
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
      </>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-3 md:py-4">
        {/* Breadcrumb */}
        <nav className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4">
          <Link href="/" className="hover:text-red-600">หน้าแรก</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">สินค้าทั้งหมด</span>
        </nav>

        {/* Mobile filter button row */}
        <div className="md:hidden flex items-center gap-2 mb-3 sticky top-[6.5rem] z-20 bg-gray-50 pb-2">
          <button
            onClick={() => setShowFilterDrawer(true)}
            className="flex items-center gap-1.5 bg-white border border-gray-300 hover:border-red-500 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 relative"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            กรอง
            {activeFilters.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] rounded-full min-w-4 h-4 px-1 flex items-center justify-center font-bold">
                {activeFilters.length}
              </span>
            )}
          </button>
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            className="flex-1 border border-gray-300 rounded-lg px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="newest">เรียง: ใหม่สุด</option>
            <option value="price_asc">เรียง: ราคาต่ำ → สูง</option>
            <option value="price_desc">เรียง: ราคาสูง → ต่ำ</option>
          </select>
        </div>

        <div className="flex gap-5">
          {/* Sidebar (desktop) */}
          <aside className="hidden md:block w-56 flex-shrink-0">
            <FilterContent />
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Header (desktop) */}
            <div className="hidden md:flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-sm text-gray-600">
                  {loading ? "กำลังโหลด..." : `พบ ${total.toLocaleString()} รายการ`}
                </p>
                {activeFilters.map((f) => (
                  <span key={f.key} className="flex items-center gap-1 text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-1 rounded-full">
                    {f.label}
                    <button onClick={() => removeFilter(f.key, f.label)} className="ml-1 hover:text-red-900 font-bold">×</button>
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
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="newest">ใหม่สุด</option>
                <option value="price_asc">ราคา: ต่ำ → สูง</option>
                <option value="price_desc">ราคา: สูง → ต่ำ</option>
              </select>
            </div>

            {/* Mobile count + active filters */}
            <div className="md:hidden mb-3">
              <p className="text-xs text-gray-600 mb-2">
                {loading ? "กำลังโหลด..." : `พบ ${total.toLocaleString()} รายการ`}
              </p>
              {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {activeFilters.map((f) => (
                    <span key={f.key} className="flex items-center gap-1 text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">
                      {f.label}
                      <button onClick={() => removeFilter(f.key, f.label)} className="ml-0.5 hover:text-red-900 font-bold">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Products grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-xl h-64 md:h-72 animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-gray-500 mb-4">ไม่พบสินค้าที่ตรงกับการค้นหา</p>
                <button onClick={clearFilters} className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-5 py-2 rounded-lg">
                  ล้างตัวกรอง
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-3">
                  {products.map((p) => (
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

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 md:px-4 py-2 text-xs md:text-sm border border-gray-300 rounded-lg bg-white disabled:opacity-50 hover:bg-gray-50"
                    >
                      ← ก่อนหน้า
                    </button>
                    <span className="text-xs md:text-sm text-gray-600 px-2">หน้า {page} / {totalPages}</span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 md:px-4 py-2 text-xs md:text-sm border border-gray-300 rounded-lg bg-white disabled:opacity-50 hover:bg-gray-50"
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

      {/* Mobile filter drawer */}
      {showFilterDrawer && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilterDrawer(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-gray-50 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
              <h2 className="font-bold text-gray-900">กรองสินค้า</h2>
              <button onClick={() => setShowFilterDrawer(false)} className="p-1 hover:bg-gray-100 rounded" aria-label="ปิด">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <FilterContent />
            </div>
            <div className="border-t border-gray-200 bg-white p-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => { clearFilters(); }}
                className="border border-gray-300 hover:bg-gray-50 text-sm font-medium text-gray-700 py-2.5 rounded-lg"
              >
                ล้างตัวกรอง
              </button>
              <button
                onClick={() => setShowFilterDrawer(false)}
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2.5 rounded-lg"
              >
                ดูผลลัพธ์ ({total.toLocaleString()})
              </button>
            </div>
          </div>
        </div>
      )}
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
