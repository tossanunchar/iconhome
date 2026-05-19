"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface Banner {
  id: number;
  title: string | null;
  imageUrl: string;
  linkUrl: string | null;
  position: number;
  isActive: boolean;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  // New banner form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", linkUrl: "", isActive: true });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Fetch all banners (including inactive) for admin
  async function fetchBanners() {
    const res = await fetch("/api/admin/banners");
    const data = await res.json();
    setBanners(data.banners || []);
    setLoading(false);
  }

  useEffect(() => { fetchBanners(); }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadFile) return alert("กรุณาเลือกรูปภาพ Banner");
    setUploading(true);

    // Upload image first
    const fd = new FormData();
    fd.append("file", uploadFile);
    const upRes = await fetch("/api/upload", { method: "POST", body: fd });
    const upData = await upRes.json();

    if (!upData.url) { setUploading(false); return alert("อัปโหลดรูปไม่สำเร็จ"); }

    // Create banner record
    await fetch("/api/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title || null,
        imageUrl: upData.url,
        linkUrl: form.linkUrl || null,
        position: banners.length,
        isActive: form.isActive,
      }),
    });

    setUploading(false);
    setShowForm(false);
    setForm({ title: "", linkUrl: "", isActive: true });
    setUploadFile(null);
    setPreview("");
    if (fileRef.current) fileRef.current.value = "";
    fetchBanners();
  }

  async function toggleActive(banner: Banner) {
    setSaving(true);
    await fetch(`/api/banners/${banner.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !banner.isActive }),
    });
    await fetchBanners();
    setSaving(false);
  }

  async function moveUp(index: number) {
    if (index === 0) return;
    const updated = [...banners];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    // Update positions
    await Promise.all(updated.map((b, i) =>
      fetch(`/api/banners/${b.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position: i }),
      })
    ));
    fetchBanners();
  }

  async function moveDown(index: number) {
    if (index === banners.length - 1) return;
    const updated = [...banners];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    await Promise.all(updated.map((b, i) =>
      fetch(`/api/banners/${b.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position: i }),
      })
    ));
    fetchBanners();
  }

  async function handleDelete(id: number) {
    if (!confirm("ลบ Banner นี้?")) return;
    await fetch(`/api/banners/${id}`, { method: "DELETE" });
    fetchBanners();
  }

  // Replace image of existing banner
  async function handleReplaceImage(banner: Banner) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setUploadingId(banner.id);
      const fd = new FormData();
      fd.append("file", file);
      const upRes = await fetch("/api/upload", { method: "POST", body: fd });
      const upData = await upRes.json();
      if (upData.url) {
        await fetch(`/api/banners/${banner.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: upData.url }),
        });
        fetchBanners();
      }
      setUploadingId(null);
    };
    input.click();
  }

  async function handleSaveField(id: number, field: string, value: string) {
    await fetch(`/api/banners/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    fetchBanners();
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">จัดการ Banner</h1>
          <p className="text-sm text-gray-500 mt-1">อัปโหลดและจัดลำดับ Banner ที่แสดงบนหน้าแรก</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          เพิ่ม Banner
        </button>
      </div>

      {/* Add Banner Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-lg p-5 mb-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">เพิ่ม Banner ใหม่</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Upload area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รูปภาพ Banner <span className="text-red-500">*</span>
              </label>
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-400 transition-colors overflow-hidden"
                style={{ minHeight: 140 }}
              >
                {preview ? (
                  <Image src={preview} alt="preview" width={600} height={140} className="w-full h-36 object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-36 text-gray-400">
                    <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">คลิกเพื่อเลือกรูปภาพ</span>
                    <span className="text-xs text-gray-400 mt-1">แนะนำขนาด 1920×480 px</span>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>

            {/* Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ Banner (สำหรับ Admin)</label>
                <input
                  type="text"
                  placeholder="เช่น Banner โปรโมชั่นมิถุนายน"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-red-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link URL (เมื่อกดคลิก)</label>
                <input
                  type="text"
                  placeholder="เช่น /category?badge=SALE"
                  value={form.linkUrl}
                  onChange={e => setForm(f => ({ ...f, linkUrl: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-red-400"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 accent-red-600"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">เปิดใช้งานทันที</label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded text-sm transition-colors disabled:opacity-60"
                >
                  {uploading ? "กำลังอัปโหลด..." : "บันทึก Banner"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setPreview(""); setUploadFile(null); }}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded text-sm hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Banner list */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">กำลังโหลด...</div>
      ) : banners.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-lg py-16 text-center">
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500 font-medium">ยังไม่มี Banner</p>
          <p className="text-sm text-gray-400 mt-1">กดปุ่ม "เพิ่ม Banner" เพื่อเริ่มต้น</p>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`bg-white border rounded-lg overflow-hidden shadow-sm transition-opacity ${!banner.isActive ? "opacity-60" : ""}`}
            >
              <div className="flex gap-4 p-4">
                {/* Image */}
                <div className="relative flex-shrink-0 w-64 h-24 bg-gray-100 rounded overflow-hidden group cursor-pointer"
                  onClick={() => handleReplaceImage(banner)}>
                  {uploadingId === banner.id ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : null}
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title || "Banner"}
                    fill
                    className="object-cover group-hover:opacity-80 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <span className="text-white text-xs font-semibold bg-black/50 px-2 py-1 rounded">เปลี่ยนรูป</span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="flex-1 space-y-2">
                      <EditableField
                        value={banner.title || ""}
                        placeholder="ชื่อ Banner (Admin only)"
                        onSave={(v) => handleSaveField(banner.id, "title", v)}
                        className="font-semibold text-gray-800 text-sm"
                      />
                      <EditableField
                        value={banner.linkUrl || ""}
                        placeholder="Link URL เมื่อกด..."
                        onSave={(v) => handleSaveField(banner.id, "linkUrl", v)}
                        className="text-sm text-blue-600"
                        prefix="🔗 "
                      />
                    </div>

                    {/* Status badge */}
                    <button
                      onClick={() => toggleActive(banner)}
                      disabled={saving}
                      className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                        banner.isActive
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {banner.isActive ? "● เปิดใช้งาน" : "○ ปิด"}
                    </button>
                  </div>

                  <div className="flex items-center gap-1 text-gray-400 text-xs">
                    <span>ลำดับ: {index + 1}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors"
                    title="ขึ้น"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === banners.length - 1}
                    className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors"
                    title="ลง"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="p-1.5 rounded hover:bg-red-50 transition-colors mt-1"
                    title="ลบ"
                  >
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Inline editable field component
function EditableField({
  value, placeholder, onSave, className = "", prefix = "",
}: {
  value: string;
  placeholder: string;
  onSave: (v: string) => void;
  className?: string;
  prefix?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  if (editing) {
    return (
      <input
        autoFocus
        type="text"
        value={val}
        onChange={e => setVal(e.target.value)}
        onBlur={() => { setEditing(false); onSave(val); }}
        onKeyDown={e => { if (e.key === "Enter") { setEditing(false); onSave(val); } if (e.key === "Escape") setEditing(false); }}
        className={`border-b border-red-400 outline-none bg-transparent w-full ${className}`}
        placeholder={placeholder}
      />
    );
  }

  return (
    <div
      onClick={() => { setVal(value); setEditing(true); }}
      className={`cursor-text hover:bg-gray-50 rounded px-1 -mx-1 transition-colors ${className} ${!value ? "text-gray-400 italic" : ""}`}
      title="คลิกเพื่อแก้ไข"
    >
      {prefix}{value || placeholder}
    </div>
  );
}
