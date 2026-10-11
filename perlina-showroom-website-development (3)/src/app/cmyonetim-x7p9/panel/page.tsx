"use client";
import { useEffect, useState } from "react";

interface DashboardData {
  products: number;
  activeProducts: number;
  collections: number;
  subcollections: number;
  applications: number;
  media: number;
  contacts: number;
  newContacts: number;
  users: number;
  recentLogs: Array<{
    id: number;
    action: string;
    description: string | null;
    createdAt: string | null;
    username: string | null;
  }>;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner w-8 h-8" />
      </div>
    );
  }

  if (!data) return <p className="text-red-600">Veri yüklenemedi.</p>;

  const stats = [
    { label: "Toplam Ürün", value: data.products, icon: "🪟" },
    { label: "Aktif Ürün", value: data.activeProducts, icon: "✅" },
    { label: "Koleksiyon", value: data.collections, icon: "🎨" },
    { label: "Alt Koleksiyon", value: data.subcollections, icon: "📂" },
    { label: "Uygulama", value: data.applications, icon: "🏠" },
    { label: "Medya", value: data.media, icon: "📷" },
    { label: "İletişim Talebi", value: data.contacts, icon: "📩" },
    { label: "Yeni Talep", value: data.newContacts, icon: "🔔", highlight: data.newContacts > 0 },
    { label: "Kullanıcı", value: data.users, icon: "👤" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-family-heading)] text-2xl font-semibold text-charcoal">Panel</h1>
        <p className="text-sm text-warm-gray-light mt-1">PERLINA yönetim paneline hoş geldiniz.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className={`admin-card ${stat.highlight ? "border-bronze bg-orange-50" : ""}`}>
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-semibold text-charcoal">{stat.value}</div>
            <div className="text-xs text-warm-gray-light mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="admin-card">
        <h2 className="text-lg font-medium text-charcoal mb-4">Son Aktiviteler</h2>
        {data.recentLogs.length === 0 ? (
          <p className="text-sm text-warm-gray-light">Henüz aktivite kaydı yok.</p>
        ) : (
          <div className="space-y-3">
            {data.recentLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 py-2 border-b border-cream last:border-0">
                <div className="w-8 h-8 rounded-full bg-cream flex items-center justify-center text-xs font-medium text-charcoal shrink-0">
                  {(log.username || "?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-charcoal">{log.description || log.action}</p>
                  <p className="text-xs text-warm-gray-light mt-0.5">
                    {log.username} • {log.createdAt ? new Date(log.createdAt).toLocaleString("tr-TR") : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
