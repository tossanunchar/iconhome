"use client";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import Image from "next/image";

const FREE_SHIPPING_THRESHOLD = 5000;

export default function CartPage() {
  const { items, removeItem, updateQty, totalItems, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-5">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">ตะกร้าสินค้าว่างเปล่า</h2>
        <p className="text-gray-500 mb-6 max-w-sm">ยังไม่มีสินค้าในตะกร้า เริ่มเลือกซื้อสินค้าที่คุณสนใจได้เลย</p>
        <div className="flex gap-3">
          <Link href="/" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors text-sm">
            เลือกซื้อสินค้า
          </Link>
          <Link href="/category" className="border border-gray-300 hover:border-red-500 hover:text-red-600 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors text-sm">
            ดูหมวดหมู่
          </Link>
        </div>
      </div>
    );
  }

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - totalPrice);
  const progress = Math.min(100, (totalPrice / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="bg-gray-50 min-h-screen pb-8">
      <div className="max-w-6xl mx-auto px-3 md:px-4 py-4 md:py-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          ตะกร้าสินค้า
          <span className="text-sm font-normal text-gray-500">({totalItems} รายการ)</span>
        </h1>

        {/* Free shipping progress bar */}
        <div className="bg-white border border-gray-200 rounded-xl p-3 md:p-4 mb-4">
          {remainingForFreeShipping > 0 ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs md:text-sm text-gray-700">
                  สั่งซื้ออีก <span className="font-bold text-red-600">฿{remainingForFreeShipping.toLocaleString()}</span> รับ <span className="font-bold text-green-600">ส่งฟรี! 🚚</span>
                </p>
                <span className="text-xs text-gray-400">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          ) : (
            <p className="text-sm font-semibold text-green-700 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              คุณได้รับสิทธิ์ส่งฟรี! 🎉
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-3 md:p-4 flex gap-3 md:gap-4">
                {/* Image */}
                <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} width={96} height={96} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info + actions */}
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      {item.brand && (
                        <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wide mb-0.5">{item.brand}</p>
                      )}
                      <Link href={`/product/${item.slug}`} className="font-medium text-gray-900 text-xs md:text-sm leading-tight hover:text-red-600 line-clamp-2">
                        {item.name}
                      </Link>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-red-600 font-bold text-sm md:text-base">฿{item.price.toLocaleString()}</span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="text-gray-400 text-xs line-through">฿{item.originalPrice.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0 p-1 -m-1"
                      aria-label="ลบสินค้า"
                    >
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-2">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                      <button
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent"
                        aria-label="ลดจำนวน"
                      >
                        −
                      </button>
                      <span className="w-8 md:w-10 text-center text-xs md:text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600"
                        aria-label="เพิ่มจำนวน"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-sm md:text-base font-bold text-gray-900">
                      ฿{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Trust badges */}
            <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4 grid grid-cols-3 gap-2">
              {[
                { icon: "🚚", title: "ส่งทั่วไทย", desc: "ฟรี ≥ ฿5,000" },
                { icon: "✓", title: "ของแท้ 100%", desc: "รับประกันคุณภาพ" },
                { icon: "💳", title: "ชำระสะดวก", desc: "โอน/บัตร/COD" },
              ].map((b) => (
                <div key={b.title} className="text-center">
                  <div className="text-xl md:text-2xl mb-1">{b.icon}</div>
                  <p className="text-xs md:text-sm font-bold text-gray-800">{b.title}</p>
                  <p className="text-[10px] md:text-xs text-gray-500">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 lg:sticky lg:top-4">
              <h2 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4">สรุปคำสั่งซื้อ</h2>
              <div className="space-y-2 text-xs md:text-sm max-h-40 overflow-y-auto mb-3 pb-3 border-b border-gray-100">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-gray-600">
                    <span className="flex-1 pr-2 line-clamp-1">{item.name} ×{item.quantity}</span>
                    <span className="font-medium flex-shrink-0">฿{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>ยอดสินค้า</span>
                  <span>฿{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>ค่าจัดส่ง</span>
                  <span>{remainingForFreeShipping === 0 ? <span className="text-green-600 font-medium">ฟรี</span> : "คำนวณหลังสั่งซื้อ"}</span>
                </div>
              </div>
              <div className="border-t border-gray-200 mt-3 pt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>รวมทั้งหมด</span>
                  <span className="text-red-600">฿{totalPrice.toLocaleString()}</span>
                </div>
              </div>
              <Link
                href="/checkout"
                className="mt-4 md:mt-6 block w-full bg-red-600 hover:bg-red-700 text-white text-center font-bold py-3 rounded-lg transition-colors"
              >
                ดำเนินการสั่งซื้อ →
              </Link>
              <Link
                href="/category"
                className="mt-2 block w-full border border-gray-300 hover:bg-gray-50 text-gray-700 text-center font-medium py-2.5 rounded-lg transition-colors text-sm"
              >
                เลือกซื้อสินค้าต่อ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
