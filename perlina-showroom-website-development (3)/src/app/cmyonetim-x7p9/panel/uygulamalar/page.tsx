"use client";
import { useEffect, useState } from "react";

interface Application {
  id: number;
  title: string;
  slug: string;
  status: string | null;
  sortOrder: number | null;
  createdAt: string | null;
}

export default function AdminApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/applications")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setApps(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="spinner w-8 h-8" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-[family-name:var(--font-family-heading)] text-2xl font-semibold text-charcoal">Uygulamalar</h1>
          <p className="text-sm text-warm-gray-light mt-1">{apps.length} uygulama</p>
        </div>
      </div>

      <div className="admin-card overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Başlık</th>
              <th>Slug</th>
              <th>Durum</th>
              <th>Sıra</th>
            </tr>
          </thead>
          <tbody>
            {apps.map(app => (
              <tr key={app.id}>
                <td className="font-medium">{app.title}</td>
                <td className="text-warm-gray-light text-xs">{app.slug}</td>
                <td>
                  <span className={`badge ${app.status === "active" ? "badge-success" : "badge-danger"}`}>
                    {app.status === "active" ? "Aktif" : "Pasif"}
                  </span>
                </td>
                <td>{app.sortOrder}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {apps.length === 0 && <p className="text-center py-8 text-warm-gray-light">Henüz uygulama eklenmemiş.</p>}
      </div>
    </div>
  );
}
