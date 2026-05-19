"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  guestName?: string | null;
  guestPhone?: string | null;
  guestEmail?: string | null;
  address?: string | null;
  notes?: string | null;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
  user?: { name: string; email: string } | null;
}

const statusOptions = [
  { value: "", label: "ทั้งหมด" },
  { value: "pending", label: "รอดำเนินการ" },
  { value: "confirmed", label: "ยืนยันแล้ว" },
  { value: "shipped", label: "กำลังจัดส่ง" },
  { value: "delivered", label: "จัดส่งแล้ว" },
  { value: "cancelled", label: "ยกเลิก" },
];

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "รอดำเนินการ", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "ยืนยันแล้ว", color: "bg-blue-100 text-blue-800" },
  shipped: { label: "กำลังจัดส่ง", color: "bg-purple-100 text-purple-800" },
  delivered: { label: "จัดส่งแล้ว", color: "bg-green-100 text-green-800" },
  cancelled: { label: "ยกเลิก", color: "bg-red-100 text-red-800" },
};

function OrdersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  function fetchOrders() {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (status) params.set("status", status);
    fetch(`/api/orders?${params}`)
      .then(r => r.json())
      .then(d => {
        setOrders(d.orders || []);
        setTotal(d.total || 0);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchOrders(); }, [page, status]);

  async function handleStatusChange(id: number, newStatus: string) {
    setUpdatingStatus(id);
    await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchOrders();
    setUpdatingStatus(null);
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">คำสั่งซื้อ</h1>
        <p className="text-gray-500 text-sm mt-1">ทั้งหมด {total} รายการ</p>
      </div>

      {/* Status filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex flex-wrap gap-2">
          {statusOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => { setStatus(opt.value); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                status === opt.value
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">กำลังโหลด...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">ไม่พบคำสั่งซื้อ</div>
        ) : (
          orders.map(order => {
            const st = statusMap[order.status] || { label: order.status, color: "bg-gray-100 text-gray-700" };
            const isExpanded = expanded === order.id;
            return (
              <div key={order.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpanded(isExpanded ? null : order.id)}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-gray-900 w-16">#{order.id}</span>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {order.guestName || order.user?.name || "ไม่ระบุชื่อ"}
                      </p>
                      <p className="text-gray-500 text-xs">{order.guestPhone || order.user?.email || ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-gray-900">฿{order.total.toLocaleString()}</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${st.color}`}>{st.label}</span>
                    <span className="text-gray-400 text-xs">
                      {new Date(order.createdAt).toLocaleDateString("th-TH")}
                    </span>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">ข้อมูลผู้สั่ง</p>
                        <p className="text-sm text-gray-900">{order.guestName || order.user?.name}</p>
                        {order.guestPhone && <p className="text-sm text-gray-600">📞 {order.guestPhone}</p>}
                        {order.guestEmail && <p className="text-sm text-gray-600">✉️ {order.guestEmail}</p>}
                        {order.address && <p className="text-sm text-gray-600">📍 {order.address}</p>}
                        {order.notes && <p className="text-sm text-gray-600 italic">"{order.notes}"</p>}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">รายการสินค้า</p>
                        <div className="space-y-1">
                          {order.items.map(item => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-gray-700">{item.name} ×{item.quantity}</span>
                              <span className="font-medium">฿{(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Status update */}
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-200">
                      <span className="text-sm font-medium text-gray-700">เปลี่ยนสถานะ:</span>
                      <div className="flex flex-wrap gap-2">
                        {statusOptions.filter(o => o.value).map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => handleStatusChange(order.id, opt.value)}
                            disabled={order.status === opt.value || updatingStatus === order.id}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                              order.status === opt.value
                                ? "bg-gray-800 text-white cursor-default"
                                : "bg-white border border-gray-300 hover:bg-gray-100 text-gray-700"
                            } disabled:opacity-50`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-500">หน้า {page} / {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 bg-white">
              ← ก่อนหน้า
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 bg-white">
              ถัดไป →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-500">กำลังโหลด...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
