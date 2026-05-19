"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "เปลี่ยนรหัสผ่านไม่สำเร็จ");
      } else {
        setSuccess("เปลี่ยนรหัสผ่านสำเร็จ! กรุณาเข้าสู่ระบบใหม่");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        // logout หลังเปลี่ยนรหัสเพื่อความปลอดภัย ให้เข้าใหม่ด้วยรหัสใหม่
        setTimeout(async () => {
          await fetch("/api/admin/auth/logout", { method: "POST" });
          router.push("/admin/login");
          router.refresh();
        }, 1500);
      }
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  }

  // คะแนนความแข็งแรงของรหัสใหม่ (0-4)
  const strength = (() => {
    let s = 0;
    if (newPassword.length >= 8) s++;
    if (newPassword.length >= 12) s++;
    if (/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) s++;
    if (/[0-9]/.test(newPassword) && /[^A-Za-z0-9]/.test(newPassword)) s++;
    return s;
  })();
  const strengthLabels = ["อ่อนมาก", "อ่อน", "ปานกลาง", "แข็งแรง", "แข็งแรงมาก"];
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-green-500"];

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <nav className="text-sm text-gray-500 mb-2">
          <Link href="/admin" className="hover:text-red-600">แดชบอร์ด</Link>
          <span className="mx-2">/</span>
          <span>ตั้งค่า</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900">เปลี่ยนรหัสผ่าน</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">เปลี่ยนรหัสผ่าน</h1>
        <p className="text-gray-500 text-sm mt-1">เพื่อความปลอดภัย ควรเปลี่ยนรหัสผ่านเริ่มต้นทันที</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              {success}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่านปัจจุบัน</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                required
                autoComplete="current-password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showCurrent ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่านใหม่</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="อย่างน้อย 8 ตัวอักษร มีตัวอักษร+ตัวเลข"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showNew ? "🙈" : "👁"}
              </button>
            </div>
            {newPassword.length > 0 && (
              <div className="mt-2">
                <div className="flex gap-1 h-1.5">
                  {[0, 1, 2, 3].map(i => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full ${i < strength ? strengthColors[strength] : "bg-gray-200"}`}
                    />
                  ))}
                </div>
                <p className={`text-xs mt-1 ${strength < 2 ? "text-red-600" : strength < 4 ? "text-yellow-600" : "text-green-600"}`}>
                  ความแข็งแรง: {strengthLabels[strength]}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ยืนยันรหัสผ่านใหม่</label>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง"
            />
            {confirmPassword.length > 0 && newPassword !== confirmPassword && (
              <p className="text-xs text-red-600 mt-1">รหัสผ่านไม่ตรงกัน</p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
            <p className="font-semibold mb-1">💡 แนะนำการตั้งรหัส:</p>
            <ul className="space-y-0.5 list-disc list-inside">
              <li>อย่างน้อย 12 ตัวอักษร</li>
              <li>มีทั้งตัวพิมพ์ใหญ่ พิมพ์เล็ก ตัวเลข และอักขระพิเศษ</li>
              <li>ไม่ใช้คำที่เดาง่าย เช่น password, admin, 12345</li>
              <li>ไม่ใช้ซ้ำกับเว็บอื่น</li>
            </ul>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || !!success}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
            >
              {loading ? "กำลังบันทึก..." : "เปลี่ยนรหัสผ่าน"}
            </button>
            <Link
              href="/admin"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              ยกเลิก
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
