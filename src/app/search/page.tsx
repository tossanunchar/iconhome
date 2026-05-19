"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  images: string;
  badge?: string | null;
  brand?: string | null;
  stock: number;
  category?: { name: string; slug: string } | null;
}

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get("q") || "";
  const [query, setQuery] = useState(q);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    setQuery(q);
  }, [q]);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    const params = new URLSearchParams({ q, sort, limit: "24" });
    fetch(`/api/products?${params}`)
      .then(r => r.json())
      .then(d => {
        setProducts(d.products || []);
        setTotal(d.total || 0);
      })
      .finally(() => setLoading(false));
  }, [q, sort]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-8 max-w-xl">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="ค้นหาสินค้า..."
        />
        <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors">
          ค้นหา
        </button>
      </form>

      {q && (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                ผลการค้นหา: &ldquo;{q}&rdquo;
              </h1>
              {!loading && <p className="text-sm text-gray-500 mt-1">พบ {total} รายการ</p>}
            </div>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="newest">ใหม่สุด</option>
              <option value="price_asc">ราคา: ต่ำ → สูง</option>
              <option value="price_desc">ราคา: สูง → ต่ำ</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-xl h-72 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-gray-500">ไม่พบสินค้าที่ค้นหา</p>
              <Link href="/" className="mt-4 inline-block text-red-600 hover:underline font-medium">
                ดูสินค้าทั้งหมด
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
          )}
        </>
      )}

      {!q && (
        <div className="text-center py-16">
          <p className="text-gray-500">กรอกคำค้นหาเพื่อค้นหาสินค้า</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">กำลังโหลด...</div>}>
      <SearchResults />
    </Suspense>
  );
}
