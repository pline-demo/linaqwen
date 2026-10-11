"use client";
import { useEffect, useState } from "react";

interface ContactRequest {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  subject: string | null;
  message: string | null;
  status: string | null;
  createdAt: string | null;
}

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactRequest | null>(null);

  async function load() {
    const res = await fetch("/api/admin/contacts");
    const data = await res.json();
    if (Array.isArray(data)) setContacts(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: number, status: string) {
    await fetch("/api/admin/contacts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    load();
  }

  const statusLabel: Record<string, string> = {
    new: "Yeni",
    read: "Okundu",
    replied: "Yanıtlandı",
    archived: "Arşiv",
  };

  const statusBadge: Record<string, string> = {
    new: "badge-info",
    read: "badge-warning",
    replied: "badge-success",
    archived: "badge-danger",
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="spinner w-8 h-8" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-family-heading)] text-2xl font-semibold text-charcoal">İletişim Talepleri</h1>
        <p className="text-sm text-warm-gray-light mt-1">{contacts.length} talep</p>
      </div>

      {selected && (
        <div className="admin-card mb-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-lg font-medium">{selected.name}</h2>
            <button onClick={() => setSelected(null)} className="text-warm-gray-light hover:text-charcoal">✕</button>
          </div>
          <div className="space-y-3 text-sm">
            <p><strong>Telefon:</strong> {selected.phone || "—"}</p>
            <p><strong>E-posta:</strong> {selected.email || "—"}</p>
            <p><strong>Konu:</strong> {selected.subject || "—"}</p>
            <p><strong>Mesaj:</strong></p>
            <p className="bg-cream-light rounded p-3 whitespace-pre-wrap">{selected.message}</p>
            <p><strong>Tarih:</strong> {selected.createdAt ? new Date(selected.createdAt).toLocaleString("tr-TR") : "—"}</p>
            <div className="flex gap-2 mt-4">
              {(["read", "replied", "archived"] as const).map(st => (
                <button key={st} onClick={() => { updateStatus(selected.id, st); setSelected({ ...selected, status: st }); }}
                  className={`text-xs px-3 py-1.5 rounded border ${selected.status === st ? "bg-charcoal text-white border-charcoal" : "border-cream-dark hover:bg-cream"}`}>
                  {statusLabel[st]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="admin-card overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ad Soyad</th>
              <th>Telefon</th>
              <th>Konu</th>
              <th>Durum</th>
              <th>Tarih</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map(c => (
              <tr key={c.id} className={c.status === "new" ? "bg-blue-50/50" : ""}>
                <td className="font-medium">{c.name}</td>
                <td className="text-sm">{c.phone || "—"}</td>
                <td className="text-sm text-warm-gray-light">{c.subject || "—"}</td>
                <td>
                  <span className={`badge ${statusBadge[c.status || "new"]}`}>
                    {statusLabel[c.status || "new"]}
                  </span>
                </td>
                <td className="text-xs text-warm-gray-light">{c.createdAt ? new Date(c.createdAt).toLocaleDateString("tr-TR") : ""}</td>
                <td>
                  <button onClick={() => setSelected(c)} className="text-xs text-bronze hover:underline">Detay</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {contacts.length === 0 && <p className="text-center py-8 text-warm-gray-light">Henüz iletişim talebi yok.</p>}
      </div>
    </div>
  );
}
