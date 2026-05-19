import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import LineChatFloat from "@/components/LineChatFloat";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { getCategories, getTopBrands } from "@/lib/siteData";

export const metadata: Metadata = {
  title: {
    default: "ไอคอนโฮม - จำหน่ายวัสดุก่อสร้างและเครื่องใช้ไฟฟ้า",
    template: "%s | ไอคอนโฮม",
  },
  description: "ไอคอนโฮม จำหน่ายวัสดุก่อสร้าง สุขภัณฑ์ กระเบื้องปูพื้น/ผนัง ไม้ฝา เครื่องใช้ไฟฟ้า เหล็กเส้น ราคาส่งตรงจากโรงงาน",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // fetch once per request (cache memoizes)
  const [categories, brands] = await Promise.all([
    getCategories(),
    getTopBrands(10),
  ]);

  return (
    <html lang="th">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <CartProvider>
            <Header categories={categories} brands={brands} />
            <main className="flex-1 pb-16 md:pb-0">
              {children}
            </main>
            <Footer />
            <MobileBottomNav />
            <LineChatFloat />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
