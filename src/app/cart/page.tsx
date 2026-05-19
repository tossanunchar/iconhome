"use client";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import Image from "next/image";

export default function CartPage() {
  const { items, removeItem, updateQty, totalItems, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <svg className="w-20 h-20 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">ตะกร้าสินค้าว่างเปล่า</h2>
        <p className="text-gray-500 mb-6">เพิ่มสินค้าที่คุณสนใจลงในตะกร้า</p>
        <Link href="/" className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
          เลือกซื้อสินค้า
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ตะกร้าสินค้า ({totalItems} รายการ)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4">
              {/* Image */}
              <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {item.image ? (
                  <Image src={item.image} alt={item.name} width={96} height={96} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{item.brand}</p>
                <Link href={`/product/${item.slug}`} className="font-medium text-gray-900 text-sm leading-tight hover:text-red-600 line-clamp-2">
                  {item.name}
                </Link>
                <p className="text-red-600 font-bold mt-1">฿{item.price.toLocaleString()}</p>
                {item.originalPrice && item.originalPrice > item.price && (
                  <p className="text-gray-400 text-xs line-through">฿{item.originalPrice.toLocaleString()}</p>
                )}
              </div>

              {/* Qty + Remove */}
              <div className="flex flex-col items-end justify-between flex-shrink-0">
                <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => updateQty(item.id, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(item.id, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600"
                  >
                    +
                  </button>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  ฿{(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">สรุปคำสั่งซื้อ</h2>
            <div className="space-y-3 text-sm">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-gray-600">
                  <span className="flex-1 pr-2 line-clamp-1">{item.name} ×{item.quantity}</span>
                  <span className="font-medium flex-shrink-0">฿{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 mt-4 pt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>รวมทั้งหมด</span>
                <span className="text-red-600">฿{totalPrice.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">* ราคายังไม่รวมค่าจัดส่ง</p>
            </div>
            <Link
              href="/checkout"
              className="mt-6 block w-full bg-red-600 hover:bg-red-700 text-white text-center font-semibold py-3 rounded-lg transition-colors"
            >
              ดำเนินการสั่งซื้อ
            </Link>
            <Link
              href="/"
              className="mt-3 block w-full border border-gray-300 hover:bg-gray-50 text-gray-700 text-center font-medium py-2.5 rounded-lg transition-colors text-sm"
            >
              เลือกซื้อสินค้าต่อ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
