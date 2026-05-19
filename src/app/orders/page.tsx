"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
}

interface Order {
  id: number;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
  guestName?: string | null;
  address?: string | null;
}

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "รอดำเนินการ", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "ยืนยันแล้ว", color: "bg-blue-100 text-blue-800" },
  shipped: { label: "กำลังจัดส่ง", color: "bg-purple-100 text-purple-800" },
  delivered: { label: "จัดส่งแล้ว", color: "bg-green-100 text-green-800" },
  cancelled: { label: "ยกเลิก", color: "bg-red-100 text-red-800" },
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      fetch("/api/orders/mine")
        .then(r => r.json())
        .then(d => setOrders(d.orders || []))
        .finally(() => setLoading(false));
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-gray-500">กำลังโหลด...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">กรุณาเข้าสู่ระบบ</h2>
        <p className="text-gray-500 mb-6">เพื่อดูประวัติคำสั่งซื้อของคุณ</p>
        <Link href="/login" className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
          เข้าสู่ระบบ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">คำสั่งซื้อของฉัน</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-500">ยังไม่มีคำสั่งซื้อ</p>
          <Link href="/" className="mt-4 inline-block text-red-600 hover:underline font-medium">
            เลือกซื้อสินค้า →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const status = statusMap[order.status] || { label: order.status, color: "bg-gray-100 text-gray-700" };
            return (
              <div key={order.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div>
                    <span className="font-bold text-gray-900">คำสั่งซื้อ #{order.id}</span>
                    <span className="text-gray-400 text-sm ml-3">
                      {new Date(order.createdAt).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}
                    </span>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${status.color}`}>
                    {status.label}
                  </span>
                </div>
                <div className="px-6 py-4">
                  <div className="space-y-2">
                    {order.items.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.name} ×{item.quantity}</span>
                        <span className="text-gray-900 font-medium">฿{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  {order.address && (
                    <p className="text-xs text-gray-500 mt-3">📍 {order.address}</p>
                  )}
                </div>
                <div className="px-6 py-3 bg-gray-50 flex justify-between items-center">
                  <span className="text-sm text-gray-500">รวมทั้งหมด</span>
                  <span className="font-bold text-red-600 text-lg">฿{order.total.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
