"use client";
import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  slug: string;
  status: string | null;
  featured: boolean | null;
  sortOrder: number | null;
  collectionName: string | null;
  createdAt: string | null;
}

export default function AdminProductsPage() {
  const [prods, setProds] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", shortDescription: "", longDescription: "", status: "active", featured: false, sortOrder: 0, collectionId: "" });
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [collections, setCollections] = useState<Array<{ id: number; name: string }>>([]);

  async function load() {
    const [pRes, cRes] = await Promise.all([
      fetch("/api/admin/products"),
      fetch("/api/admin/collections"),
    ]);
    const pData = await pRes.json();
    const cData = await cRes.json();
    if (Array.isArray(pData)) setProds(pData);
    if (Array.isArray(cData)) setCollections(cData);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const url = editId ? `/api/admin/products/${editId}` : "/api/admin/products";
    const method = editId ? "PUT" : "POST";
    const payload = { ...form, collectionId: form.collectionId ? parseInt(form.collectionId) : null };
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    setShowForm(false);
    setEditId(null);
    setForm({ name: "", slug: "", shortDescription: "", longDescription: "", status: "active", featured: false, sortOrder: 0, collectionId: "" });
    load();
  }

  async function handleDelete(id: number) {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    load();
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="spinner w-8 h-8" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-[family-name:var(--font-family-heading)] text-2xl font-semibold text-charcoal">Ürünler</h1>
          <p className="text-sm text-warm-gray-light mt-1">{prods.length} ürün</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); }} className="btn-primary text-sm">+ Yeni Ürün</button>
      </div>

      {showForm && (
        <div className="admin-card mb-6">
          <h2 className="text-lg font-medium mb-4">{editId ? "Ürün Düzenle" : "Yeni Ürün"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Ad</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="form-input" />
              </div>
              <div>
                <label className="form-label">Koleksiyon</label>
                <select value={form.collectionId} onChange={e => setForm({ ...form, collectionId: e.target.value })} className="form-input">
                  <option value="">Koleksiyon Seçin</option>
                  {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="form-label">Kısa Açıklama</label>
              <textarea value={form.shortDescription} onChange={e => setForm({ ...form, shortDescription: e.target.value })} rows={2} className="form-input" />
            </div>
            <div>
              <label className="form-label">Detaylı Açıklama</label>
              <textarea value={form.longDescription} onChange={e => setForm({ ...form, longDescription: e.target.value })} rows={4} className="form-input" />
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
              <th>Koleksiyon</th>
              <th>Durum</th>
              <th>Öne Çıkan</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {prods.map(prod => (
              <tr key={prod.id}>
                <td className="font-medium">{prod.name}</td>
                <td className="text-sm text-warm-gray-light">{prod.collectionName || "—"}</td>
                <td>
                  <span className={`badge ${prod.status === "active" ? "badge-success" : prod.status === "draft" ? "badge-warning" : "badge-danger"}`}>
                    {prod.status === "active" ? "Aktif" : prod.status === "draft" ? "Taslak" : "Pasif"}
                  </span>
                </td>
                <td>{prod.featured ? "⭐" : "—"}</td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => handleDelete(prod.id)} className="text-xs text-red-600 hover:underline">Sil</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {prods.length === 0 && <p className="text-center py-8 text-warm-gray-light">Henüz ürün eklenmemiş.</p>}
      </div>
    </div>
  );
}
