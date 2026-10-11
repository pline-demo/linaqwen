"use client";
import { useEffect, useState } from "react";

interface Collection {
  id: number;
  name: string;
  slug: string;
  status: string | null;
  featured: boolean | null;
  sortOrder: number | null;
  createdAt: string | null;
}

export default function AdminCollectionsPage() {
  const [cols, setCols] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", shortDescription: "", status: "active", featured: false, sortOrder: 0 });
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  async function load() {
    const res = await fetch("/api/admin/collections");
    const data = await res.json();
    if (Array.isArray(data)) setCols(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const url = editId ? `/api/admin/collections/${editId}` : "/api/admin/collections";
    const method = editId ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    setShowForm(false);
    setEditId(null);
    setForm({ name: "", slug: "", shortDescription: "", status: "active", featured: false, sortOrder: 0 });
    load();
  }

  async function handleDelete(id: number) {
    if (!confirm("Bu koleksiyonu silmek istediğinize emin misiniz?")) return;
    await fetch(`/api/admin/collections/${id}`, { method: "DELETE" });
    load();
  }

  function startEdit(col: Collection) {
    setEditId(col.id);
    setForm({ name: col.name, slug: col.slug, shortDescription: "", status: col.status || "active", featured: col.featured || false, sortOrder: col.sortOrder || 0 });
    setShowForm(true);
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="spinner w-8 h-8" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-[family-name:var(--font-family-heading)] text-2xl font-semibold text-charcoal">Koleksiyonlar</h1>
          <p className="text-sm text-warm-gray-light mt-1">{cols.length} koleksiyon</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: "", slug: "", shortDescription: "", status: "active", featured: false, sortOrder: 0 }); }}
          className="btn-primary text-sm">
          + Yeni Koleksiyon
        </button>
      </div>

      {showForm && (
        <div className="admin-card mb-6">
          <h2 className="text-lg font-medium mb-4">{editId ? "Koleksiyon Düzenle" : "Yeni Koleksiyon"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Ad</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="form-input" />
              </div>
              <div>
                <label className="form-label">Slug</label>
                <input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="form-input" placeholder="Otomatik oluşturulur" />
              </div>
            </div>
            <div>
              <label className="form-label">Kısa Açıklama</label>
              <textarea value={form.shortDescription} onChange={e => setForm({ ...form, shortDescription: e.target.value })} rows={2} className="form-input" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Durum</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="form-input">
                  <option value="active">Aktif</option>
                  <option value="inactive">Pasif</option>
                  <option value="draft">Taslak</option>
                </select>
              </div>
              <div>
                <label className="form-label">Sıra</label>
                <input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} className="form-input" />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4" />
                  <span className="text-sm">Öne Çıkan</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? "Kaydediliyor..." : "Kaydet"}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="btn-secondary text-sm">İptal</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ad</th>
              <th>Slug</th>
              <th>Durum</th>
              <th>Öne Çıkan</th>
              <th>Sıra</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {cols.map(col => (
              <tr key={col.id}>
                <td className="font-medium">{col.name}</td>
                <td className="text-warm-gray-light text-xs">{col.slug}</td>
                <td>
                  <span className={`badge ${col.status === "active" ? "badge-success" : col.status === "draft" ? "badge-warning" : "badge-danger"}`}>
                    {col.status === "active" ? "Aktif" : col.status === "draft" ? "Taslak" : "Pasif"}
                  </span>
                </td>
                <td>{col.featured ? "⭐" : "—"}</td>
                <td>{col.sortOrder}</td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(col)} className="text-xs text-bronze hover:underline">Düzenle</button>
                    <button onClick={() => handleDelete(col.id)} className="text-xs text-red-600 hover:underline">Sil</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {cols.length === 0 && <p className="text-center py-8 text-warm-gray-light">Henüz koleksiyon eklenmemiş.</p>}
      </div>
    </div>
  );
}
