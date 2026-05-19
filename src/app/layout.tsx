import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "ไอคอนโฮม - จำหน่ายวัสดุก่อสร้างและเครื่องใช้ไฟฟ้า",
  description: "ไอคอนโฮม จำหน่ายวัสดุก่อสร้าง สุขภัณฑ์ กระเบื้องปูพื้น/ผนัง ไม้ฝา เครื่องใช้ไฟฟ้า เหล็กเส้น",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
