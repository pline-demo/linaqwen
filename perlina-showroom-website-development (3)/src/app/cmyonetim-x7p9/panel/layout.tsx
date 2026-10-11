import { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/cmyonetim-x7p9");

  return (
    <div className="flex min-h-screen bg-cream-light">
      <AdminSidebar username={user.username} fullName={user.fullName || ""} isSuperAdmin={user.isSuperAdmin || false} />
      <main className="flex-1 min-w-0 lg:ml-64">
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
