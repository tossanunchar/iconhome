export const dynamic = "force-dynamic";

import prisma from "@/lib/db";
import ProductForm from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">เพิ่มสินค้าใหม่</h1>
        <p className="text-gray-500 text-sm mt-1">กรอกข้อมูลสินค้าที่ต้องการเพิ่ม</p>
      </div>
      <ProductForm categories={categories} mode="new" />
    </div>
  );
}
