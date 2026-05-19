import Link from "next/link";

export const dynamic = "force-dynamic";

const items = [
  {
    href: "/admin/settings/password",
    title: "เปลี่ยนรหัสผ่าน",
    desc: "ตั้งรหัสผ่าน admin ใหม่ให้แข็งแรงและจำง่าย",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    color: "bg-red-100 text-red-600",
  },
  {
    href: "/admin/settings/badges",
    title: "จัดการ Badge สินค้า",
    desc: "ใส่/รีเซ็ต badge NEW / HOT / SALE ให้สินค้า 8,100 รายการ",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    color: "bg-orange-100 text-orange-600",
  },
];

export default function SettingsHubPage() {
  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ตั้งค่า</h1>
        <p className="text-gray-500 text-sm mt-1">การตั้งค่าระบบและคำสั่งจัดการสินค้า</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-red-300 transition-all group"
          >
            <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
              {item.icon}
            </div>
            <h2 className="font-bold text-gray-900 mb-1 group-hover:text-red-600 transition-colors">
              {item.title}
            </h2>
            <p className="text-sm text-gray-500">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
