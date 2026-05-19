import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import HeroBanner from "@/components/HeroBanner";
import prisma from "@/lib/db";

const categories = [
  { name: "เครื่องปรับอากาศ", slug: "air-conditioner", bg: "bg-blue-50", color: "#3B82F6",
    svg: <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9"><rect x="4" y="12" width="40" height="16" rx="4" fill="#DBEAFE"/><rect x="4" y="12" width="40" height="16" rx="4" stroke="#3B82F6" strokeWidth="2"/><line x1="4" y1="20" x2="44" y2="20" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="3 3"/><circle cx="36" cy="16" r="2.5" fill="#3B82F6"/><path d="M12 30 Q14 36 16 30" stroke="#3B82F6" strokeWidth="1.5" fill="none"/><path d="M20 30 Q22 36 24 30" stroke="#3B82F6" strokeWidth="1.5" fill="none"/><path d="M28 30 Q30 36 32 30" stroke="#3B82F6" strokeWidth="1.5" fill="none"/></svg>
  },
  { name: "เครื่องซักผ้า", slug: "washing-machine", bg: "bg-cyan-50", color: "#06B6D4",
    svg: <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9"><rect x="6" y="4" width="36" height="40" rx="4" fill="#CFFAFE"/><rect x="6" y="4" width="36" height="40" rx="4" stroke="#06B6D4" strokeWidth="2"/><circle cx="24" cy="27" r="11" stroke="#06B6D4" strokeWidth="2"/><circle cx="24" cy="27" r="5" fill="#CFFAFE" stroke="#06B6D4" strokeWidth="1.5"/><rect x="10" y="10" width="5" height="3" rx="1" fill="#06B6D4"/><circle cx="32" cy="11.5" r="2" fill="#06B6D4"/></svg>
  },
  { name: "ตู้เย็น", slug: "refrigerator", bg: "bg-sky-50", color: "#0EA5E9",
    svg: <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9"><rect x="10" y="4" width="28" height="40" rx="3" fill="#E0F2FE"/><rect x="10" y="4" width="28" height="40" rx="3" stroke="#0EA5E9" strokeWidth="2"/><line x1="10" y1="22" x2="38" y2="22" stroke="#0EA5E9" strokeWidth="2"/><line x1="19" y1="12" x2="19" y2="19" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round"/><line x1="19" y1="28" x2="19" y2="36" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round"/></svg>
  },
  { name: "โทรทัศน์", slug: "tv", bg: "bg-purple-50", color: "#8B5CF6",
    svg: <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9"><rect x="4" y="8" width="40" height="26" rx="3" fill="#EDE9FE"/><rect x="4" y="8" width="40" height="26" rx="3" stroke="#8B5CF6" strokeWidth="2"/><rect x="8" y="12" width="32" height="18" rx="1" fill="#EDE9FE" stroke="#8B5CF6" strokeWidth="1"/><line x1="16" y1="38" x2="32" y2="38" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round"/><line x1="24" y1="34" x2="24" y2="38" stroke="#8B5CF6" strokeWidth="2"/></svg>
  },
  { name: "วัสดุก่อสร้าง", slug: "construction", bg: "bg-orange-50", color: "#F97316",
    svg: <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9"><rect x="4" y="28" width="40" height="8" rx="2" fill="#FED7AA"/><rect x="4" y="28" width="40" height="8" rx="2" stroke="#F97316" strokeWidth="2"/><rect x="4" y="19" width="40" height="9" rx="1" fill="#FFEDD5" stroke="#F97316" strokeWidth="2"/><rect x="4" y="10" width="40" height="9" rx="1" fill="#FFF7ED" stroke="#F97316" strokeWidth="2"/><line x1="14" y1="10" x2="14" y2="36" stroke="#F97316" strokeWidth="1.5"/><line x1="24" y1="10" x2="24" y2="36" stroke="#F97316" strokeWidth="1.5"/><line x1="34" y1="10" x2="34" y2="36" stroke="#F97316" strokeWidth="1.5"/></svg>
  },
  { name: "กระเบื้อง", slug: "tile", bg: "bg-amber-50", color: "#F59E0B",
    svg: <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9"><rect x="4" y="4" width="18" height="18" rx="2" fill="#FDE68A"/><rect x="4" y="4" width="18" height="18" rx="2" stroke="#F59E0B" strokeWidth="2"/><rect x="26" y="4" width="18" height="18" rx="2" fill="#FDE68A" opacity="0.7"/><rect x="26" y="4" width="18" height="18" rx="2" stroke="#F59E0B" strokeWidth="2"/><rect x="4" y="26" width="18" height="18" rx="2" fill="#FDE68A" opacity="0.7"/><rect x="4" y="26" width="18" height="18" rx="2" stroke="#F59E0B" strokeWidth="2"/><rect x="26" y="26" width="18" height="18" rx="2" fill="#FDE68A"/><rect x="26" y="26" width="18" height="18" rx="2" stroke="#F59E0B" strokeWidth="2"/></svg>
  },
  { name: "สุขภัณฑ์", slug: "sanitary", bg: "bg-teal-50", color: "#14B8A6",
    svg: <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9"><ellipse cx="24" cy="32" rx="16" ry="10" fill="#CCFBF1"/><ellipse cx="24" cy="32" rx="16" ry="10" stroke="#14B8A6" strokeWidth="2"/><path d="M14 32 Q16 22 24 20 Q32 22 34 32" fill="#CCFBF1" stroke="#14B8A6" strokeWidth="2"/><rect x="20" y="8" width="8" height="12" rx="2" fill="#CCFBF1" stroke="#14B8A6" strokeWidth="2"/></svg>
  },
  { name: "เหล็กเส้น", slug: "steel", bg: "bg-gray-100", color: "#6B7280",
    svg: <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9"><rect x="6" y="20" width="36" height="5" rx="2" fill="#E5E7EB"/><rect x="6" y="20" width="36" height="5" rx="2" stroke="#6B7280" strokeWidth="2"/><rect x="6" y="28" width="36" height="5" rx="2" fill="#E5E7EB"/><rect x="6" y="28" width="36" height="5" rx="2" stroke="#6B7280" strokeWidth="2"/><rect x="6" y="12" width="36" height="5" rx="2" fill="#E5E7EB"/><rect x="6" y="12" width="36" height="5" rx="2" stroke="#6B7280" strokeWidth="2"/></svg>
  },
];

const brands = [
  { name: "LG", textColor: "text-red-600" },
  { name: "Samsung", textColor: "text-blue-800" },
  { name: "Mitsubishi", textColor: "text-red-700" },
  { name: "Daikin", textColor: "text-blue-700" },
  { name: "Hitachi", textColor: "text-red-800" },
  { name: "Panasonic", textColor: "text-blue-900" },
  { name: "Carrier", textColor: "text-blue-700" },
  { name: "Toshiba", textColor: "text-red-600" },
];

async function getHomeProducts() {
  const [newProducts, saleProducts] = await Promise.all([
    prisma.product.findMany({
      where: { badge: "NEW" },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.product.findMany({
      where: { badge: "SALE" },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);
  return { newProducts, saleProducts };
}

function parseImages(raw: string): string[] {
  try { return JSON.parse(raw); } catch { return []; }
}

export default async function HomePage() {
  const { newProducts, saleProducts } = await getHomeProducts();

  return (
    <div>
      {/* Hero Banner — dynamic from DB, falls back to static if none uploaded */}
      <HeroBanner fallback={
        <section className="relative overflow-hidden" style={{ background: "#E30613", minHeight: "260px" }}>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute right-0 top-0 bottom-0 w-64"
              style={{ background: "linear-gradient(135deg, transparent 0%, rgba(255,200,0,0.15) 100%)" }} />
            <div className="absolute -left-10 -top-10 w-80 h-80 rounded-full bg-white opacity-5" />
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-52 flex flex-col items-center justify-center"
            style={{ background: "linear-gradient(180deg, #FFD600 0%, #FFC300 100%)" }}>
            <div className="text-center px-3">
              <p className="text-red-700 font-black text-sm leading-tight">สินค้าโครงสร้าง</p>
              <p className="text-red-800 font-bold text-xs mt-1">วันนี้ - 30 มิ.ย. 67</p>
              <div className="mt-3 border-t-2 border-red-600/30 pt-2">
                <p className="text-red-700 font-black text-2xl leading-none">สรีไท</p>
                <p className="text-red-600 text-xs font-semibold">ทุกรุ่น ทุกขนาด</p>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 py-6 relative" style={{ marginRight: "13rem" }}>
            <div className="flex items-center gap-8">
              <div className="text-white">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-yellow-400 text-red-800 text-xs font-black px-2.5 py-0.5 rounded uppercase tracking-wide">โปรโมชั่น</span>
                  <span className="text-white/80 text-sm">วันนี้ - 30 มิ.ย. 67</span>
                </div>
                <div className="text-6xl font-black leading-none mb-1" style={{ textShadow: "3px 3px 0 rgba(0,0,0,0.2)" }}>
                  ทุบราคา
                </div>
                <div className="text-xl font-bold text-yellow-300 mb-4">สินค้าโครงสร้าง</div>
                <Link href="/category?badge=SALE" className="inline-flex items-center gap-2 bg-white text-red-600 font-bold px-5 py-2 rounded hover:bg-yellow-300 hover:text-red-700 transition-colors text-sm shadow">
                  ดูโปรโมชั่นทั้งหมด
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-52 bg-black/20 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-4">
              {[
                { label: "อิฐบล็อก", price: "5.5", unit: "บาท/ก้อน" },
                { label: "เหล็กเส้น", price: "26", unit: "บาท/เส้น" },
                { label: "กระเบื้อง", price: "109", unit: "บาท/แผ่น" },
                { label: "ปูนซีเมนต์", price: "22", unit: "บาท/ถุง" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-white">
                  <div className="text-center">
                    <span className="text-white/80 text-xs">{item.label} </span>
                    <span className="text-yellow-300 font-black text-lg">{item.price}</span>
                    <span className="text-white/70 text-xs"> {item.unit}</span>
                  </div>
                  <span className="text-white/30 text-lg">|</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      } />

      {/* Category section */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span className="w-1 h-5 bg-red-600 rounded-full inline-block"></span>
            หมวดหมู่สินค้า
          </h2>
          <Link href="/category" className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-0.5">
            ดูทั้งหมด
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
          {categories.map((cat) => (
            <Link key={cat.name} href={`/category?category=${cat.slug}`}
              className={`flex flex-col items-center gap-2 py-4 px-2 ${cat.bg} rounded-lg hover:shadow-sm transition-all group text-center border border-transparent hover:border-gray-200`}
            >
              <div className="w-11 h-11 flex items-center justify-center">
                {cat.svg}
              </div>
              <span className="text-xs font-medium text-gray-700 group-hover:text-red-600 transition-colors leading-tight">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Brand section */}
      <section className="border-t border-b border-gray-100 bg-gray-50 py-5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="w-1 h-5 bg-red-600 rounded-full inline-block"></span>
              สินค้าตามแบรนด์
            </h2>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {brands.map((brand) => (
              <Link key={brand.name} href={`/category?brand=${encodeURIComponent(brand.name)}`}
                className="bg-white rounded border border-gray-200 px-3 py-4 flex flex-col items-center gap-2 hover:border-red-300 hover:shadow-sm transition-all group"
              >
                <div className="w-12 h-8 flex items-center justify-center">
                  <span className={`text-lg font-black ${brand.textColor}`}>{brand.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New products */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-1 h-5 bg-red-600 rounded-full inline-block"></span>
            <h2 className="text-lg font-bold text-gray-800">สินค้ามาใหม่</h2>
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded">NEW</span>
          </div>
          <Link href="/category?badge=NEW" className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-0.5">
            ดูทั้งหมด
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {newProducts.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              slug={p.slug}
              price={p.price}
              originalPrice={p.originalPrice}
              images={parseImages(p.images)}
              badge={p.badge}
              brand={p.brand}
              stock={p.stock}
            />
          ))}
          {newProducts.length === 0 && (
            <p className="col-span-4 text-center text-gray-400 py-8">ยังไม่มีสินค้า</p>
          )}
        </div>
      </section>

      {/* Sale products */}
      <section className="bg-gray-50 border-t border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-1 h-5 bg-red-600 rounded-full inline-block"></span>
              <h2 className="text-lg font-bold text-gray-800">โปรโมชั่นทุกราคา</h2>
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">HOT</span>
            </div>
            <Link href="/category?badge=SALE" className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-0.5">
              ดูทั้งหมด
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {saleProducts.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                slug={p.slug}
                price={p.price}
                originalPrice={p.originalPrice}
                images={parseImages(p.images)}
                badge={p.badge}
                brand={p.brand}
                stock={p.stock}
              />
            ))}
            {saleProducts.length === 0 && (
              <p className="col-span-4 text-center text-gray-400 py-8">ยังไม่มีสินค้า</p>
            )}
          </div>
        </div>
      </section>

      {/* About store banner */}
      <section className="bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="text-white flex-1">
              <h2 className="text-2xl font-bold mb-2">
                <span className="text-red-500">ไอคอนโฮม</span>
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                จำหน่ายวัสดุก่อสร้าง : สุขภัณฑ์ กระเบื้องปูพื้น/ผนัง ไม้ฝา เครื่องใช้ไฟฟ้า เหล็กเส้น สรีไท พัดลมไม้
                ราคาส่งตรงจากโรงงาน เปิดให้บริการทุกวัน 08.00 - 18.00 น.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-6 text-center flex-shrink-0">
              {[
                { number: "10+", label: "ปีประสบการณ์" },
                { number: "500+", label: "รายการสินค้า" },
                { number: "2", label: "สาขา" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl font-black text-yellow-400">{stat.number}</div>
                  <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
