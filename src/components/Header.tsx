"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import type { CategoryItem } from "@/lib/siteData";

type HeaderProps = {
  categories: CategoryItem[];
  brands: string[];
};

export default function Header({ categories, brands }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const router = useRouter();
  const { totalItems } = useCart();
  const { user, logout } = useAuth();

  // ปิด body scroll เมื่อเปิด mobile menu
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  }

  async function handleLogout() {
    await logout();
    setShowUserMenu(false);
    setMobileMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <header className="w-full shadow-sm sticky top-0 z-40 bg-white">
        {/* Top bar (desktop only) */}
        <div className="hidden md:block bg-gray-900 text-white text-sm py-1.5">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                080-329-3258 / 063-412-8250
              </span>
              <span className="text-gray-500">|</span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                เปิดทุกวัน 08:00 - 18:00 น.
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <a href="https://www.facebook.com/iconhome2022" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
                Facebook
              </a>
              <span className="text-gray-500">|</span>
              <Link href="/contact" className="hover:text-red-400 transition-colors">ติดต่อเรา</Link>
            </div>
          </div>
        </div>

        {/* Main header */}
        <div className="bg-white border-b border-gray-100 py-2 md:py-3">
          <div className="max-w-7xl mx-auto px-3 md:px-4 flex items-center gap-3 md:gap-6">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden -ml-1 p-1.5 text-gray-700 hover:bg-gray-100 rounded"
              aria-label="เปิดเมนู"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/logo.png"
                alt="ไอคอนโฮม"
                width={140}
                height={46}
                className="object-contain h-8 md:h-12 w-auto"
                priority
              />
            </Link>

            {/* Search bar (desktop) */}
            <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-2xl">
              <div className="flex items-center bg-white rounded border border-gray-300 overflow-hidden focus-within:border-red-500 transition-colors">
                <svg className="w-5 h-5 ml-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="ค้นหาสินค้า..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent"
                />
                <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 text-sm font-medium transition-colors">
                  ค้นหา
                </button>
              </div>
            </form>

            {/* Right actions */}
            <div className="flex items-center gap-3 md:gap-4 flex-shrink-0 ml-auto">
              {/* User menu (desktop) */}
              {user ? (
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setShowUserMenu((v) => !v)}
                    onBlur={() => setTimeout(() => setShowUserMenu(false), 150)}
                    className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-red-600 transition-colors"
                  >
                    <div className="w-7 h-7 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 font-bold text-xs">{user.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="max-w-24 truncate">{user.name}</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-1 w-44 bg-white shadow-lg border border-gray-100 rounded-lg z-50 py-1">
                      <Link href="/orders" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        คำสั่งซื้อของฉัน
                      </Link>
                      <hr className="my-1 border-gray-100" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        ออกจากระบบ
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="hidden md:block text-sm text-gray-600 hover:text-red-600 transition-colors whitespace-nowrap">
                  เข้าสู่ระบบ
                </Link>
              )}
              <span className="hidden md:inline text-gray-200">|</span>
              <Link href="/cart" className="flex items-center gap-1 text-gray-700 hover:text-red-600 transition-colors relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full min-w-5 h-5 px-1 flex items-center justify-center font-bold">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Search bar (mobile) — below logo row */}
          <form onSubmit={handleSearch} className="md:hidden mt-2 px-3">
            <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 overflow-hidden focus-within:border-red-500 transition-colors">
              <svg className="w-4 h-4 ml-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="ค้นหาสินค้า..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-2 py-2 text-sm outline-none bg-transparent"
              />
            </div>
          </form>
        </div>

        {/* Navigation (desktop only) */}
        <div className="hidden md:block bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 flex items-center">
            {/* Category dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setOpenDropdown("category")}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                  <rect x="1" y="1" width="6" height="6" rx="1"/>
                  <rect x="9" y="1" width="6" height="6" rx="1"/>
                  <rect x="1" y="9" width="6" height="6" rx="1"/>
                  <rect x="9" y="9" width="6" height="6" rx="1"/>
                </svg>
                หมวดหมู่สินค้าทั้งหมด
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openDropdown === "category" && (
                <div className="absolute top-full left-0 w-64 bg-white shadow-xl border border-gray-100 z-50 py-1">
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/category?category=${cat.slug}`}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Nav items */}
            <div
              className="relative"
              onMouseEnter={() => setOpenDropdown("brand")}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <Link href="/category" className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-gray-700 hover:text-red-600 transition-colors font-medium">
                สินค้าตามแบรนด์
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              {openDropdown === "brand" && brands.length > 0 && (
                <div className="absolute top-full left-0 w-64 bg-white shadow-xl border border-gray-100 z-50 py-1 max-h-96 overflow-auto">
                  {brands.map((b) => (
                    <Link
                      key={b}
                      href={`/category?brand=${encodeURIComponent(b)}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      {b}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/category?sort=newest" className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-gray-700 hover:text-red-600 transition-colors font-medium">
              สินค้ามาใหม่
              <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded font-bold">NEW</span>
            </Link>

            <Link href="/category?badge=HOT" className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-gray-700 hover:text-red-600 transition-colors font-medium">
              สินค้ายอดนิยม
              <span className="bg-red-600 text-white text-xs px-1.5 py-0.5 rounded font-bold">HOT</span>
            </Link>

            <Link href="/contact" className="px-4 py-2.5 text-sm text-gray-700 hover:text-red-600 transition-colors font-medium">
              ติดต่อเรา
            </Link>
            <Link href="/about" className="px-4 py-2.5 text-sm text-gray-700 hover:text-red-600 transition-colors font-medium">
              เกี่ยวกับเรา
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile slide-in drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-red-600 text-white">
              <div className="flex items-center gap-2">
                {user ? (
                  <>
                    <div className="w-9 h-9 bg-red-700 rounded-full flex items-center justify-center font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{user.name}</p>
                      <p className="text-xs text-red-100">{user.email}</p>
                    </div>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="font-bold">
                    เข้าสู่ระบบ / สมัครสมาชิก
                  </Link>
                )}
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 hover:bg-red-700 rounded"
                aria-label="ปิดเมนู"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable nav */}
            <nav className="flex-1 overflow-y-auto">
              {/* Categories accordion */}
              <button
                onClick={() => setMobileExpanded(mobileExpanded === "cats" ? null : "cats")}
                className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-100 font-semibold text-sm text-gray-800"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 16 16">
                    <rect x="1" y="1" width="6" height="6" rx="1"/>
                    <rect x="9" y="1" width="6" height="6" rx="1"/>
                    <rect x="1" y="9" width="6" height="6" rx="1"/>
                    <rect x="9" y="9" width="6" height="6" rx="1"/>
                  </svg>
                  หมวดหมู่สินค้า
                </span>
                <svg className={`w-4 h-4 transition-transform ${mobileExpanded === "cats" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {mobileExpanded === "cats" && (
                <div className="bg-gray-50">
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/category?category=${cat.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-8 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 border-b border-gray-100 last:border-b-0"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Brands accordion */}
              <button
                onClick={() => setMobileExpanded(mobileExpanded === "brands" ? null : "brands")}
                className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-100 font-semibold text-sm text-gray-800"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  สินค้าตามแบรนด์
                </span>
                <svg className={`w-4 h-4 transition-transform ${mobileExpanded === "brands" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {mobileExpanded === "brands" && (
                <div className="bg-gray-50">
                  {brands.map((b) => (
                    <Link
                      key={b}
                      href={`/category?brand=${encodeURIComponent(b)}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-8 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 border-b border-gray-100 last:border-b-0"
                    >
                      {b}
                    </Link>
                  ))}
                </div>
              )}

              {[
                { href: "/category?sort=newest", label: "สินค้ามาใหม่", badge: "NEW", badgeColor: "bg-blue-600" },
                { href: "/category?badge=HOT", label: "สินค้ายอดนิยม", badge: "HOT", badgeColor: "bg-red-600" },
                { href: "/orders", label: "คำสั่งซื้อของฉัน", auth: true },
                { href: "/contact", label: "ติดต่อเรา" },
                { href: "/about", label: "เกี่ยวกับเรา" },
                { href: "/branch", label: "สาขาใกล้คุณ" },
              ].filter(item => !item.auth || user).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3 border-b border-gray-100 text-sm text-gray-800 hover:bg-gray-50"
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`${item.badgeColor} text-white text-xs px-1.5 py-0.5 rounded font-bold`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}

              {user && (
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 border-b border-gray-100 hover:bg-red-50"
                >
                  ออกจากระบบ
                </button>
              )}
            </nav>

            {/* Footer contact */}
            <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-2 text-xs text-gray-600">
              <a href="tel:0803293258" className="flex items-center gap-2 hover:text-red-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>สาขาเสลภูมิ 080-329-3258</span>
              </a>
              <a href="tel:0634128250" className="flex items-center gap-2 hover:text-red-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>สาขาเลิงนกทา 063-412-8250</span>
              </a>
              <p className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>เปิดทุกวัน 08:00 - 18:00 น.</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
