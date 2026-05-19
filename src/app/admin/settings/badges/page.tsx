"use client";
import { useState } from "react";
import Link from "next/link";

type Summary = { badge: string; count: number };
type Result = {
  ok: true;
  cleared: number;
  assigned: { NEW: number; SALE: number; HOT: number };
  summary: Summary[];
};

export default function ManageBadgesPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function runRegenerate() {
    setLoading(true);
    setError("");
    setResult(null);
    setConfirmOpen(false);
    try {
      const res = await fetch("/api/admin/utils/assign-badges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "เกิดข้อผิดพลาด");
      } else {
        setResult(data);
      }
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl">
      <nav className="text-sm text-gray-500 mb-2">
        <Link href="/admin" className="hover:text-red-600">แดชบอร์ด</Link>
        <span className="mx-2">/</span>
        <Link href="/admin/settings" className="hover:text-red-600">ตั้งค่า</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">จัดการ Badge</span>
      </nav>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">จัดการ Badge สินค้า</h1>
      <p className="text-gray-500 text-sm mb-6">ใส่ NEW / HOT / SALE ให้สินค้าโดยอัตโนมัติตามเกณฑ์</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="font-bold text-gray-900 mb-3">เกณฑ์การใส่ Badge</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded mt-0.5">NEW</span>
            <span>สินค้า <b>100 รายการล่าสุด</b> เรียงตามวันที่สร้าง</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded mt-0.5">SALE</span>
            <span>สินค้าที่มี <b>originalPrice &gt; price</b> สูงสุด 200 รายการ (เรียงตามส่วนลดมากสุด)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded mt-0.5">HOT</span>
            <span>สินค้าราคาแพงสุด <b>30 รายการ</b> ที่ยังไม่มี badge อื่น</span>
          </li>
        </ul>
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
          <p className="font-semibold mb-1">⚠️ การทำงาน:</p>
          <p>ระบบจะ <b>ลบ badge เก่าทั้งหมด</b> ก่อน แล้วใส่ใหม่ตามเกณฑ์ — รันซ้ำได้ปลอดภัย (idempotent)</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        {!confirmOpen && !result && (
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold px-6 py-2.5 rounded-lg text-sm flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            รัน Regenerate Badges
          </button>
        )}

        {confirmOpen && (
          <div>
            <p className="text-sm text-gray-700 mb-3">
              ยืนยันการลบ badge เก่าทั้งหมดและใส่ใหม่? (ไม่กระทบสินค้าหรือออเดอร์)
            </p>
            <div className="flex gap-2">
              <button
                onClick={runRegenerate}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold px-5 py-2 rounded-lg text-sm"
              >
                {loading ? "กำลังประมวลผล..." : "ยืนยัน รัน"}
              </button>
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={loading}
                className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-5 py-2 rounded-lg text-sm"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mt-3">
            {error}
          </div>
        )}

        {result && (
          <div>
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 font-semibold mb-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                สำเร็จ!
              </div>
              <ul className="text-sm space-y-1">
                <li>ลบ badge เก่า: <b>{result.cleared}</b> รายการ</li>
                <li>ใส่ NEW: <b>{result.assigned.NEW}</b> รายการ</li>
                <li>ใส่ SALE: <b>{result.assigned.SALE}</b> รายการ</li>
                <li>ใส่ HOT: <b>{result.assigned.HOT}</b> รายการ</li>
              </ul>
            </div>

            <h3 className="font-bold text-gray-900 mb-2 text-sm">สรุปสถานะปัจจุบัน:</h3>
            <table className="w-full text-sm border border-gray-200 rounded overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-gray-700">Badge</th>
                  <th className="text-right px-4 py-2 font-medium text-gray-700">จำนวนสินค้า</th>
                </tr>
              </thead>
              <tbody>
                {result.summary.map((row) => (
                  <tr key={row.badge} className="border-t border-gray-100">
                    <td className="px-4 py-2">{row.badge}</td>
                    <td className="px-4 py-2 text-right font-semibold">{row.count.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              onClick={() => { setResult(null); setError(""); }}
              className="mt-4 text-sm text-red-600 hover:underline"
            >
              ← รันใหม่อีกครั้ง
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
