import prisma from "@/lib/db";
import Link from "next/link";

async function getStats() {
  const [productCount, orderCount, customerCount, recentOrders, pendingCount] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
    prisma.order.count({ where: { status: "pending" } }),
  ]);
  return { productCount, orderCount, customerCount, recentOrders, pendingCount };
}

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "รอดำเนินการ", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "ยืนยันแล้ว", color: "bg-blue-100 text-blue-800" },
  shipped: { label: "กำลังจัดส่ง", color: "bg-purple-100 text-purple-800" },
  delivered: { label: "จัดส่งแล้ว", color: "bg-green-100 text-green-800" },
  cancelled: { label: "ยกเลิก", color: "bg-red-100 text-red-800" },
};

export default async function AdminDashboard() {
  const { productCount, orderCount, customerCount, recentOrders, pendingCount } = await getStats();

  const stats = [
    { label: "สินค้าทั้งหมด", value: productCount, icon: "📦", color: "bg-blue-50 text-blue-600", href: "/admin/products" },
    { label: "คำสั่งซื้อทั้งหมด", value: orderCount, icon: "🛒", color: "bg-green-50 text-green-600", href: "/admin/orders" },
    { label: "รอดำเนินการ", value: pendingCount, icon: "⏳", color: "bg-yellow-50 text-yellow-600", href: "/admin/orders?status=pending" },
    { label: "ลูกค้าทั้งหมด", value: customerCount, icon: "👤", color: "bg-purple-50 text-purple-600", href: "/admin/customers" },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ด</h1>
        <p className="text-gray-500 text-sm mt-1">ภาพรวมร้านค้า ไอคอนโฮม</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <Link key={s.label} href={s.href} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${s.color} text-xl mb-3`}>
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link
          href="/admin/products/new"
          className="bg-red-600 hover:bg-red-700 text-white rounded-xl p-5 flex items-center gap-4 transition-colors"
        >
          <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center text-2xl">➕</div>
          <div>
            <p className="font-bold text-lg">เพิ่มสินค้าใหม่</p>
            <p className="text-red-200 text-sm">เพิ่มสินค้าเข้าระบบ</p>
          </div>
        </Link>
        <Link
          href="/admin/orders"
          className="bg-white border border-gray-200 hover:shadow-md text-gray-900 rounded-xl p-5 flex items-center gap-4 transition-shadow"
        >
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center text-2xl">📋</div>
          <div>
            <p className="font-bold text-lg">จัดการคำสั่งซื้อ</p>
            <p className="text-gray-500 text-sm">{pendingCount} รายการรอดำเนินการ</p>
          </div>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">คำสั่งซื้อล่าสุด</h2>
          <Link href="/admin/orders" className="text-sm text-red-600 hover:underline">ดูทั้งหมด →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-3">รหัส</th>
                <th className="px-6 py-3">ชื่อ</th>
                <th className="px-6 py-3">สินค้า</th>
                <th className="px-6 py-3">รวม</th>
                <th className="px-6 py-3">สถานะ</th>
                <th className="px-6 py-3">วันที่</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">ยังไม่มีคำสั่งซื้อ</td>
                </tr>
              ) : (
                recentOrders.map(order => {
                  const status = statusMap[order.status] || { label: order.status, color: "bg-gray-100 text-gray-700" };
                  return (
                    <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium">#{order.id}</td>
                      <td className="px-6 py-3">{order.guestName || "—"}</td>
                      <td className="px-6 py-3 text-gray-500">{order.items.length} รายการ</td>
                      <td className="px-6 py-3 font-semibold">฿{order.total.toLocaleString()}</td>
                      <td className="px-6 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString("th-TH")}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
