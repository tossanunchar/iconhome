"use client";
import { useEffect, useState } from "react";
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
  category?: { name: string } | null;
  createdAt: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);

  function fetchProducts() {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("q", search);
    fetch(`/api/products?${params}`)
      .then(r => r.json())
      .then(d => {
        setProducts(d.products || []);
        setTotal(d.total || 0);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchProducts(); }, [page, search]);

  async function handleDelete(id: number, name: string) {
    if (!confirm(`ลบสินค้า "${name}" ?`)) return;
    setDeleting(id);
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    fetchProducts();
    setDeleting(null);
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">สินค้า</h1>
          <p className="text-gray-500 text-sm mt-1">ทั้งหมด {total} รายการ</p>
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

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <form onSubmit={e => { e.preventDefault(); setPage(1); setSearch(searchInput); }} className="flex gap-3">
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="ค้นหาสินค้า..."
          />
          <button type="submit" className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            ค้นหา
          </button>
          {search && (
            <button type="button" onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }} className="border border-gray-300 hover:bg-gray-50 text-gray-600 px-4 py-2 rounded-lg text-sm transition-colors">
              ล้าง
            </button>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 w-16">รูป</th>
                <th className="px-4 py-3">ชื่อสินค้า</th>
                <th className="px-4 py-3">แบรนด์</th>
                <th className="px-4 py-3">หมวดหมู่</th>
                <th className="px-4 py-3">ราคา</th>
                <th className="px-4 py-3">สต็อก</th>
                <th className="px-4 py-3">Badge</th>
                <th className="px-4 py-3 w-28">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">กำลังโหลด...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">ไม่พบสินค้า</td></tr>
              ) : (
                products.map(p => {
                  const imgs = (() => { try { return JSON.parse(p.images); } catch { return []; } })();
                  return (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                          {imgs[0] ? (
                            <Image src={imgs[0]} alt={p.name} width={48} height={48} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl">📷</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 line-clamp-2 max-w-xs">{p.name}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{p.brand || "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{p.category?.name || "—"}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">฿{p.price.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {p.badge ? (
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-600 text-white">{p.badge}</span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
                          >
                            แก้ไข
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            disabled={deleting === p.id}
                            className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
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
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">หน้า {page} / {totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                ← ก่อนหน้า
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                ถัดไป →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
