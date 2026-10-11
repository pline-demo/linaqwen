"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const BASE = "/cmyonetim-x7p9/panel";

const navItems = [
  { label: "Panel", href: "", icon: "📊" },
  { label: "Ana Sayfa", href: "/anasayfa", icon: "🏠" },
  { label: "Koleksiyonlar", href: "/koleksiyonlar", icon: "🎨" },
  { label: "Alt Koleksiyonlar", href: "/alt-koleksiyonlar", icon: "📂" },
  { label: "Ürünler", href: "/urunler", icon: "🪟" },
  { label: "Uygulamalar", href: "/uygulamalar", icon: "📷" },
  { label: "Mağaza", href: "/magaza", icon: "🏪" },
  { label: "İletişim Talepleri", href: "/iletisim", icon: "📩" },
  { label: "Ayarlar", href: "/ayarlar", icon: "⚙️" },
  { label: "Loglar", href: "/loglar", icon: "📋" },
];

interface Props {
  username: string;
  fullName: string;
  isSuperAdmin: boolean;
}

export default function AdminSidebar({ username, fullName, isSuperAdmin }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/cmyonetim-x7p9");
  }

  const isActive = (href: string) => {
    const full = BASE + href;
    if (href === "") return pathname === BASE || pathname === BASE + "/";
    return pathname.startsWith(full);
  };

  const sidebar = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10">
        <Link href={BASE} className="block">
          <h2 className="font-[family-name:var(--font-family-heading)] text-xl font-semibold text-white tracking-wider">PERLINA</h2>
          <span className="text-xs text-white/40">Yönetim Paneli</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link key={item.href} href={BASE + item.href}
            onClick={() => setMobileOpen(false)}
            className={`admin-nav-item ${isActive(item.href) ? "active" : ""}`}>
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-bronze/30 flex items-center justify-center text-white text-sm font-medium">
            {(fullName || username).charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">{fullName || username}</p>
            <p className="text-xs text-white/40">{isSuperAdmin ? "Süper Yönetici" : "Yönetici"}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full text-left text-xs text-white/50 hover:text-white transition-colors">
          Çıkış Yap →
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-charcoal text-white rounded-lg flex items-center justify-center shadow-lg"
        aria-label="Menü">
        {mobileOpen ? "✕" : "☰"}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />}

      {/* Mobile sidebar */}
      <aside className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 admin-sidebar transform transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {sidebar}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 admin-sidebar z-30">
        {sidebar}
      </aside>
    </>
  );
}
