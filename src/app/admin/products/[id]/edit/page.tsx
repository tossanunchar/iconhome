import prisma from "@/lib/db";
import ProductForm from "@/components/admin/ProductForm";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id: parseInt(id) } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  const images = (() => { try { return JSON.parse(product.images); } catch { return []; } })();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">แก้ไขสินค้า</h1>
        <p className="text-gray-500 text-sm mt-1 line-clamp-1">{product.name}</p>
      </div>
      <ProductForm
        categories={categories}
        mode="edit"
        initialData={{
          id: product.id,
          name: product.name,
          description: product.description || "",
          price: String(product.price),
          originalPrice: product.originalPrice ? String(product.originalPrice) : "",
          stock: String(product.stock),
          brand: product.brand || "",
          badge: product.badge || "",
          categoryId: product.categoryId ? String(product.categoryId) : "",
          images,
        }}
      />
    </div>
  );
}
