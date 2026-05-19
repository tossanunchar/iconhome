"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

const categoryItems = [
  { label: "เครื่องปรับอากาศ", slug: "air-conditioner" },
  { label: "เครื่องซักผ้า", slug: "washing-machine" },
  { label: "ตู้เย็น", slug: "refrigerator" },
  { label: "โทรทัศน์", slug: "tv" },
  { label: "วัสดุก่อสร้าง", slug: "construction" },
  { label: "กระเบื้อง", slug: "tile" },
  { label: "สุขภัณฑ์", slug: "sanitary" },
  { label: "เหล็กเส้น", slug: "steel" },
];

const subCategories = categoryItems.map(c => c.label);

const navItems = [
  {
    label: "สินค้าตามแบรนด์",
    href: "/category",
    dropdown: ["LG", "Samsung", "Mitsubishi", "Daikin", "Hitachi", "Panasonic"],
    dropdownHref: (item: string) => `/category?brand=${encodeURIComponent(item)}`,
  },
  {
    label: "สินค้ามาใหม่",
    href: "/category?badge=NEW",
    badge: "NEW",
    badgeColor: "bg-blue-600",
    dropdown: subCategories,
    dropdownHref: (item: string) => `/category?q=${encodeURIComponent(item)}`,
  },
  {
    label: "โปรโมชั่นทุกราคา",
    href: "/category?badge=SALE",
    badge: "HOT",
    badgeColor: "bg-red-600",
    dropdown: subCategories,
    dropdownHref: (item: string) => `/category?q=${encodeURIComponent(item)}`,
  },
  { label: "ติดต่อเรา", href: "/contact" },
  { label: "เกี่ยวกับเรา", href: "/about" },
];

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();
  const { totalItems } = useCart();
  const { user, logout } = useAuth();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  async function handleLogout() {
    await logout();
    setShowUserMenu(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="w-full shadow-sm sticky top-0 z-50 bg-white">
      {/* Top bar */}
      <div className="bg-gray-900 text-white text-sm py-1.5">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              02 999 9999
            </span>
            <span className="text-gray-500">|</span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              08:00 - 18:00 น.
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <Link href="/branch" className="hover:text-red-400 transition-colors">สาขาใกล้คุณ</Link>
            <span className="text-gray-500">|</span>
            <button className="font-semibold text-red-400">TH</button>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-white border-b border-gray-100 py-3">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo.png"
              alt="ไอคอนโฮม"
              width={160}
              height={52}
              className="object-contain"
              priority
            />
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="flex items-center bg-white rounded border border-gray-300 overflow-hidden focus-within:border-red-500 transition-colors">
              <svg className="w-5 h-5 ml-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="ค้นหาสินค้า"
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
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* User menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(v => !v)}
                  onBlur={() => setTimeout(() => setShowUserMenu(false), 150)}
                  className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-red-600 transition-colors"
                >
                  <div className="w-7 h-7 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-bold text-xs">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="hidden sm:inline max-w-24 truncate">{user.name}</span>
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
              <Link href="/login" className="text-sm text-gray-600 hover:text-red-600 transition-colors whitespace-nowrap">
                เข้าสู่ระบบ
              </Link>
            )}
            <span className="text-gray-200">|</span>
            <Link href="/cart" className="flex items-center gap-1 text-gray-700 hover:text-red-600 transition-colors relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 flex items-center">
          {/* Category dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setOpenDropdown("category")}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-sm font-medium text-gray-800 transition-colors">
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
              <div className="absolute top-full left-0 w-56 bg-white shadow-lg border border-gray-100 z-50">
                {categoryItems.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/category?category=${cat.slug}`}
                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Nav items */}
          {navItems.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => item.dropdown ? setOpenDropdown(item.label) : undefined}
              onMouseLeave={() => item.dropdown ? setOpenDropdown(null) : undefined}
            >
              {item.dropdown ? (
                <>
                  <Link href={item.href} className="flex items-center gap-1.5 px-4 py-3 text-sm text-gray-700 hover:text-red-600 transition-colors font-medium">
                    {item.label}
                    {item.badge && (
                      <span className={`${item.badgeColor} text-white text-xs px-1.5 py-0.5 rounded font-bold`}>
                        {item.badge}
                      </span>
                    )}
                    <svg className="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Link>
                  {openDropdown === item.label && (
                    <div className="absolute top-full left-0 w-52 bg-white shadow-lg border border-gray-100 z-50">
                      {item.dropdown.map((sub) => (
                        <Link
                          key={sub}
                          href={item.dropdownHref ? item.dropdownHref(sub) : `#`}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          {sub}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  className="flex items-center gap-1.5 px-4 py-3 text-sm text-gray-700 hover:text-red-600 transition-colors font-medium"
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
