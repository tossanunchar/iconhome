"use client";
import { useEffect, useState } from "react";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  createdAt: string;
  _count: { orders: number };
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/customers?page=${page}`)
      .then(r => r.json())
      .then(d => {
        setCustomers(d.customers || []);
        setTotal(d.total || 0);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ลูกค้า</h1>
        <p className="text-gray-500 text-sm mt-1">ทั้งหมด {total} คน</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3">#</th>
                <th className="px-6 py-3">ชื่อ</th>
                <th className="px-6 py-3">อีเมล</th>
                <th className="px-6 py-3">เบอร์โทร</th>
                <th className="px-6 py-3">คำสั่งซื้อ</th>
                <th className="px-6 py-3">สมัครเมื่อ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">กำลังโหลด...</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">ยังไม่มีลูกค้า</td></tr>
              ) : (
                customers.map(c => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-400">{c.id}</td>
                    <td className="px-6 py-3 font-medium text-gray-900">{c.name}</td>
                    <td className="px-6 py-3 text-gray-600">{c.email}</td>
                    <td className="px-6 py-3 text-gray-600">{c.phone || "—"}</td>
                    <td className="px-6 py-3">
                      <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                        {c._count.orders} รายการ
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {new Date(c.createdAt).toLocaleDateString("th-TH")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">หน้า {page} / {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50">
                ← ก่อนหน้า
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50">
                ถัดไป →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
