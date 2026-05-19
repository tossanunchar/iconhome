import type { Metadata } from "next";
import prisma from "@/lib/db";
import ProductDetailClient from "./ProductDetailClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.iconhometh.com";

type RouteParams = { id: string };

// route param ชื่อ "id" แต่จริงๆเป็น slug
async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });
}

export async function generateMetadata({ params }: { params: Promise<RouteParams> }): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductBySlug(id);
  if (!product) {
    return { title: "ไม่พบสินค้า | ไอคอนโฮม" };
  }

  let images: string[] = [];
  try { images = JSON.parse(product.images || "[]"); } catch { /* noop */ }
  const image = images[0];
  const description = product.description?.slice(0, 160) ||
    `${product.name} ราคา ฿${product.price.toLocaleString()} จากร้านไอคอนโฮม จัดส่งทั่วไทย`;
  const title = `${product.name}${product.brand ? ` (${product.brand})` : ""} | ไอคอนโฮม`;
  const url = `${SITE_URL}/product/${product.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "ไอคอนโฮม",
      locale: "th_TH",
      images: image ? [{ url: image, alt: product.name }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<RouteParams> }) {
  const { id } = await params;
  const product = await getProductBySlug(id);

  // JSON-LD structured data สำหรับ Google Rich Results
  // (ไม่ block render — ใส่ใน <script type="application/ld+json">)
  const jsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description || undefined,
        sku: String(product.id),
        brand: product.brand
          ? { "@type": "Brand", name: product.brand }
          : undefined,
        category: product.category?.name,
        image: (() => {
          try {
            return JSON.parse(product.images || "[]");
          } catch {
            return [];
          }
        })(),
        offers: {
          "@type": "Offer",
          url: `${SITE_URL}/product/${product.slug}`,
          priceCurrency: "THB",
          price: product.price,
          availability: product.stock > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          seller: { "@type": "Organization", name: "ไอคอนโฮม" },
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductDetailClient />
    </>
  );
}
