"use client";
import { useState } from "react";
import Link from "next/link";

type Sample = { id: number; price: number; oldStock: number; newStock: number };
type Distribution = Record<string, number>;
type PreviewResult = {
  mode: "preview";
  willUpdate: number;
  onlyZero: boolean;
  samples: Sample[];
  distribution: Distribution;
};
type UpdateResult = {
  mode: "update";
  updated: number;
  summary: { bucket: string; count: number }[];
};

export default function StockManagementPage() {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [result, setResult] = useState<UpdateResult | null>(null);
  const [error, setError] = useState("");
  const [onlyZero, setOnlyZero] = useState(true);

  async function runPreview() {
    setLoading(true);
    setError("");
    setPreview(null);
    setResult(null);
    try {
      const res = await fetch("/api/admin/utils/randomize-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onlyZero }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "เกิดข้อผิดพลาด");
      else setPreview(data);
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    } finally {
      setLoading(false);
    }
  }

  async function runConfirm() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/utils/randomize-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onlyZero, confirm: true }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "เกิดข้อผิดพลาด");
      else {
        setResult(data);
        setPreview(null);
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
        <span className="text-gray-900">จัดการสต็อก</span>
      </nav>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">สุ่ม Stock อัตโนมัติ</h1>
      <p className="text-gray-500 text-sm mb-6">ใส่ stock เริ่มต้นให้สินค้าตามช่วงราคา</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="font-bold text-gray-900 mb-3">สูตรการสุ่ม stock</h2>
        <p className="text-sm text-gray-700 mb-3">
          ใช้สูตร <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">stock = round(500/√price) × (0.5–1.5)</code>
          <br/>เก็บ stock น้อยลงเมื่อราคาแพง (สมจริงตามวัสดุก่อสร้าง):
        </p>
        <table className="w-full text-sm border border-gray-200 rounded">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-3 py-2">ช่วงราคา</th>
              <th className="text-left px-3 py-2">ตัวอย่าง stock ที่จะได้</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-gray-100"><td className="px-3 py-2">฿1 – 100</td><td className="px-3 py-2">~25-75</td></tr>
            <tr className="border-t border-gray-100"><td className="px-3 py-2">฿100 – 1,000</td><td className="px-3 py-2">~8-35</td></tr>
            <tr className="border-t border-gray-100"><td className="px-3 py-2">฿1,000 – 10,000</td><td className="px-3 py-2">~3-15</td></tr>
            <tr className="border-t border-gray-100"><td className="px-3 py-2">฿10,000 – 50,000</td><td className="px-3 py-2">~2-8</td></tr>
            <tr className="border-t border-gray-100"><td className="px-3 py-2">฿50,000 +</td><td className="px-3 py-2">~1-3</td></tr>
          </tbody>
        </table>
        <p className="text-xs text-gray-500 mt-3">
          * ผลลัพธ์เป็น <b>deterministic</b> (ใช้ product id เป็น seed) — รันซ้ำได้ผลเหมือนเดิม
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="mb-4">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyZero}
              onChange={(e) => setOnlyZero(e.target.checked)}
              className="mt-1 accent-red-600 w-4 h-4"
            />
            <div>
              <p className="font-medium text-sm text-gray-800">อัปเดตเฉพาะสินค้าที่ stock = 0 (แนะนำ)</p>
              <p className="text-xs text-gray-500">ไม่ปะทับ stock ที่ตั้งไว้แล้ว</p>
            </div>
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-3">
            {error}
          </div>
        )}

        {!preview && !result && (
          <button
            onClick={runPreview}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold px-6 py-2.5 rounded-lg text-sm"
          >
            {loading ? "กำลังคำนวณ..." : "1. คำนวณ Preview"}
          </button>
        )}

        {preview && !result && (
          <div>
            <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-lg p-4 mb-4 text-sm">
              <p className="font-semibold mb-2">📊 จะอัปเดต {preview.willUpdate.toLocaleString()} รายการ</p>
              <p className="font-medium mb-1">การกระจาย stock:</p>
              <ul className="text-xs space-y-0.5">
                {Object.entries(preview.distribution).map(([bucket, count]) => (
                  <li key={bucket}>• stock <b>{bucket}</b>: {count.toLocaleString()} รายการ</li>
                ))}
              </ul>
              <p className="font-medium mt-3 mb-1">ตัวอย่าง (5 รายการแรก):</p>
              <table className="text-xs w-full">
                <thead>
                  <tr className="border-b border-blue-200">
                    <th className="text-left">ID</th>
                    <th className="text-right">ราคา</th>
                    <th className="text-right">stock เดิม</th>
                    <th className="text-right">stock ใหม่</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.samples.map((s) => (
                    <tr key={s.id} className="border-b border-blue-100">
                      <td>#{s.id}</td>
                      <td className="text-right">฿{s.price.toLocaleString()}</td>
                      <td className="text-right">{s.oldStock}</td>
                      <td className="text-right font-bold">{s.newStock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-2">
              <button
                onClick={runConfirm}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold px-6 py-2.5 rounded-lg text-sm"
              >
                {loading ? "กำลังอัปเดต..." : `2. ยืนยัน อัปเดต ${preview.willUpdate.toLocaleString()} รายการ`}
              </button>
              <button
                onClick={() => { setPreview(null); setError(""); }}
                className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        )}

        {result && (
          <div>
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 mb-4">
              <p className="font-semibold flex items-center gap-2 mb-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                อัปเดตสำเร็จ {result.updated.toLocaleString()} รายการ
              </p>
              <p className="font-medium text-sm mb-1">สรุปการกระจาย stock ปัจจุบัน:</p>
              <ul className="text-xs space-y-0.5">
                {result.summary.map((s) => (
                  <li key={s.bucket}>• stock <b>{s.bucket}</b>: {s.count.toLocaleString()} รายการ</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => { setResult(null); setError(""); }}
              className="text-sm text-red-600 hover:underline"
            >
              ← รันใหม่อีกครั้ง
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
