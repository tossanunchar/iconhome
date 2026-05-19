"use client";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    // Login page: full screen overlay, no sidebar
    return (
      <div className="fixed inset-0 z-50 bg-gray-900 overflow-auto flex items-center justify-center">
        {children}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-100 overflow-hidden flex">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
