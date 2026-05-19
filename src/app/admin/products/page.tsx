"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  stock: number;
  brand?: string | null;
  badge?: string | null;
  images: string;
  category?: { name: string; slug: string } | null;
  createdAt: string;
}

type Category = { id: number; name: string; slug: string };

const BADGES = [
  { value: "", label: "ทั้งหมด" },
  { value: "NEW", label: "NEW", color: "bg-blue-600" },
  { value: "HOT", label: "HOT", color: "bg-orange-500" },
  { value: "SALE", label: "SALE", color: "bg-red-600" },
  { value: "_none", label: "ไม่มี badge" },
];

const STOCK_FILTERS = [
  { value: "", label: "ทั้งหมด" },
  { value: "in", label: "มีในคลัง" },
  { value: "low", label: "ใกล้หมด (≤5)" },
  { value: "out", label: "หมด" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "ล่าสุดก่อน" },
  { value: "oldest", label: "เก่าสุดก่อน" },
  { value: "name_asc", label: "ชื่อ A→Z" },
  { value: "price_asc", label: "ราคา ต่ำ→สูง" },
  { value: "price_desc", label: "ราคา สูง→ต่ำ" },
  { value: "stock_asc", label: "สต็อก น้อย→มาก" },
  { value: "stock_desc", label: "สต็อก มาก→น้อย" },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // ---- filter state ----
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [badge, setBadge] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");

  // ---- meta ----
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  // ---- action state ----
  const [deleting, setDeleting] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  function fetchProducts() {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("q", search);
    if (category) params.set("category", category);
    if (brand) params.set("brand", brand);
    if (badge === "_none") params.set("noBadge", "1");
    else if (badge) params.set("badge", badge);
    if (stockFilter) params.set("stock", stockFilter);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (sort) params.set("sort", sort);

    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setProducts(d.products || []);
        setTotal(d.total || 0);
        setSelectedIds(new Set()); // reset selection ตอน fetch ใหม่
      })
      .finally(() => setLoading(false));
  }

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

  // ---- fetch products on filter change ----
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, category, brand, badge, stockFilter, minPrice, maxPrice, sort]);

  function resetFilters() {
    setSearchInput("");
    setSearch("");
    setCategory("");
    setBrand("");
    setBadge("");
    setStockFilter("");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    setPage(1);
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`ลบสินค้า "${name}" ?`)) return;
    setDeleting(id);
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    fetchProducts();
    setDeleting(null);
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return;
    if (!confirm(`ลบสินค้า ${selectedIds.size} รายการที่เลือก?`)) return;
    setBulkDeleting(true);
    try {
      await fetch("/api/admin/utils/delete-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds), confirm: true }),
      });
      fetchProducts();
    } finally {
      setBulkDeleting(false);
    }
  }

  function toggleAllOnPage() {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)));
    }
  }

  function toggleOne(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const activeFilters = useMemo(() => {
    const f: { key: string; label: string; clear: () => void }[] = [];
    if (search) f.push({ key: "search", label: `🔍 ${search}`, clear: () => { setSearchInput(""); setSearch(""); setPage(1); } });
    if (category) f.push({ key: "cat", label: categories.find((c) => c.slug === category)?.name || category, clear: () => { setCategory(""); setPage(1); } });
    if (brand) f.push({ key: "brand", label: brand, clear: () => { setBrand(""); setPage(1); } });
    if (badge) f.push({ key: "badge", label: badge === "_none" ? "ไม่มี badge" : badge, clear: () => { setBadge(""); setPage(1); } });
    if (stockFilter) f.push({ key: "stock", label: STOCK_FILTERS.find((s) => s.value === stockFilter)?.label || stockFilter, clear: () => { setStockFilter(""); setPage(1); } });
    if (minPrice || maxPrice) f.push({ key: "price", label: `฿${minPrice || "0"}–${maxPrice || "∞"}`, clear: () => { setMinPrice(""); setMaxPrice(""); setPage(1); } });
    return f;
  }, [search, category, brand, badge, stockFilter, minPrice, maxPrice, categories]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="p-6 max-w-[1400px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">สินค้า</h1>
          <p className="text-gray-500 text-sm mt-1">ทั้งหมด {total.toLocaleString()} รายการ</p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          เพิ่มสินค้า
        </Link>
      </div>

      {/* Filter Panel */}
      <div className="bg-white rounded-xl border border-gray-200 mb-4">
        <div className="p-4 space-y-3">
          {/* Row 1: search + primary filters */}
          <div className="flex flex-wrap items-center gap-2">
            <form
              onSubmit={(e) => { e.preventDefault(); setPage(1); setSearch(searchInput); }}
              className="flex-1 min-w-[200px] max-w-md"
            >
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="ค้นหาชื่อสินค้า..."
                  className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </form>

            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
            >
              <option value="">หมวดหมู่ทั้งหมด</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>

            <select
              value={brand}
              onChange={(e) => { setBrand(e.target.value); setPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
            >
              <option value="">แบรนด์ทั้งหมด</option>
              {brands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`border ${showAdvanced ? "border-red-500 text-red-600" : "border-gray-300 text-gray-700"} hover:bg-gray-50 rounded-lg px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              ตัวกรองเพิ่มเติม
              <svg className={`w-3 h-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Row 2: advanced filters (collapsible) */}
          {showAdvanced && (
            <div className="pt-3 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Badge */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Badge</label>
                <div className="flex flex-wrap gap-1.5">
                  {BADGES.map((b) => (
                    <button
                      key={b.value}
                      onClick={() => { setBadge(b.value); setPage(1); }}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        badge === b.value
                          ? "border-red-500 bg-red-50 text-red-700 font-semibold"
                          : "border-gray-300 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">สต็อก</label>
                <div className="flex flex-wrap gap-1.5">
                  {STOCK_FILTERS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => { setStockFilter(s.value); setPage(1); }}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        stockFilter === s.value
                          ? "border-red-500 bg-red-50 text-red-700 font-semibold"
                          : "border-gray-300 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">ช่วงราคา (บาท)</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="ต่ำสุด"
                    className="flex-1 w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                  <span className="text-gray-400 text-xs">→</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="สูงสุด"
                    className="flex-1 w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                  <button
                    onClick={() => setPage(1)}
                    className="bg-gray-800 hover:bg-gray-700 text-white text-xs px-3 py-1 rounded-lg"
                  >
                    ใช้
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Active filters bar */}
          {activeFilters.length > 0 && (
            <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500">ตัวกรองที่ใช้:</span>
              {activeFilters.map((f) => (
                <span key={f.key} className="flex items-center gap-1 text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">
                  {f.label}
                  <button onClick={f.clear} className="ml-0.5 hover:text-red-900 font-bold leading-none">×</button>
                </span>
              ))}
              <button onClick={resetFilters} className="text-xs text-gray-500 hover:text-gray-700 underline ml-auto">
                ล้างทั้งหมด
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="bg-red-600 text-white rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
          <span className="text-sm font-medium">เลือก {selectedIds.size} รายการ</span>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs bg-red-700 hover:bg-red-800 px-3 py-1.5 rounded-lg"
            >
              ยกเลิกการเลือก
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="text-xs bg-white text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg font-semibold disabled:opacity-50"
            >
              {bulkDeleting ? "กำลังลบ..." : `ลบ ${selectedIds.size} รายการ`}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100 bg-gray-50">
                <th className="px-3 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={products.length > 0 && selectedIds.size === products.length}
                    onChange={toggleAllOnPage}
                    className="accent-red-600 w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className="px-3 py-3 w-14">รูป</th>
                <th className="px-3 py-3">ชื่อสินค้า</th>
                <th className="px-3 py-3">แบรนด์</th>
                <th className="px-3 py-3">หมวดหมู่</th>
                <th className="px-3 py-3 text-right">ราคา</th>
                <th className="px-3 py-3 text-center">สต็อก</th>
                <th className="px-3 py-3 text-center">Badge</th>
                <th className="px-3 py-3 w-28">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-gray-400">กำลังโหลด...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-10 text-center">
                  <div className="text-gray-400">ไม่พบสินค้า</div>
                  {activeFilters.length > 0 && (
                    <button onClick={resetFilters} className="text-red-600 hover:underline text-sm mt-2">
                      ล้างตัวกรอง
                    </button>
                  )}
                </td></tr>
              ) : (
                products.map((p) => {
                  const imgs = (() => { try { return JSON.parse(p.images); } catch { return []; } })();
                  const isSelected = selectedIds.has(p.id);
                  const badgeStyle: Record<string, string> = {
                    NEW: "bg-blue-600 text-white",
                    HOT: "bg-orange-500 text-white",
                    SALE: "bg-red-600 text-white",
                  };
                  return (
                    <tr key={p.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${isSelected ? "bg-red-50/40" : ""}`}>
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOne(p.id)}
                          className="accent-red-600 w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <div className="w-11 h-11 bg-gray-100 rounded-lg overflow-hidden">
                          {imgs[0] ? (
                            <Image src={imgs[0]} alt={p.name} width={44} height={44} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center text-gray-300 text-lg">📷</div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-medium text-gray-900 line-clamp-1 max-w-xs">{p.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">#{p.id}</p>
                      </td>
                      <td className="px-3 py-3 text-gray-600 text-xs">{p.brand || "—"}</td>
                      <td className="px-3 py-3 text-gray-600 text-xs">{p.category?.name || "—"}</td>
                      <td className="px-3 py-3 font-semibold text-gray-900 text-right whitespace-nowrap">฿{p.price.toLocaleString()}</td>
                      <td className="px-3 py-3 text-center">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          p.stock <= 0 ? "bg-red-100 text-red-700" :
                          p.stock <= 5 ? "bg-yellow-100 text-yellow-700" :
                          "bg-green-100 text-green-700"
                        }`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        {p.badge ? (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${badgeStyle[p.badge] || "bg-gray-600 text-white"}`}>{p.badge}</span>
                        ) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-1.5">
                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1.5 rounded font-medium transition-colors"
                          >
                            แก้
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            disabled={deleting === p.id}
                            className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1.5 rounded font-medium transition-colors disabled:opacity-50"
                          >
                            ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 flex-wrap gap-2">
            <p className="text-sm text-gray-500">
              หน้า {page} / {totalPages} • แสดง {products.length} จาก {total.toLocaleString()} รายการ
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                ⇤
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                ← ก่อนหน้า
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                ถัดไป →
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                ⇥
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
