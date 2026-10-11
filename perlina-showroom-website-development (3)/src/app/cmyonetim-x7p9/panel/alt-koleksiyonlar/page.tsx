"use client";
import { useEffect, useState } from "react";

interface Subcollection {
  id: number;
  name: string;
  slug: string;
  status: string | null;
  featured: boolean | null;
  sortOrder: number | null;
  collectionId: number | null;
  collectionName: string | null;
}

interface Collection {
  id: number;
  name: string;
}

export default function AdminSubcollectionsPage() {
  const [subs, setSubs] = useState<Subcollection[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", description: "", status: "active", featured: false, sortOrder: 0, collectionId: "" });
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  async function load() {
    const [sRes, cRes] = await Promise.all([
      fetch("/api/admin/subcollections"),
      fetch("/api/admin/collections"),
    ]);
    const sData = await sRes.json();
    const cData = await cRes.json();
    if (Array.isArray(sData)) setSubs(sData);
    if (Array.isArray(cData)) setCollections(cData);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const url = editId ? `/api/admin/subcollections/${editId}` : "/api/admin/subcollections";
    const method = editId ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    setShowForm(false);
    setEditId(null);
    setForm({ name: "", slug: "", description: "", status: "active", featured: false, sortOrder: 0, collectionId: "" });
    load();
  }

  async function handleDelete(id: number) {
    if (!confirm("Bu alt koleksiyonu silmek istediğinize emin misiniz?")) return;
    await fetch(`/api/admin/subcollections/${id}`, { method: "DELETE" });
    load();
  }

  function startEdit(sub: Subcollection) {
    setEditId(sub.id);
    setForm({
      name: sub.name,
      slug: sub.slug,
      description: "",
      status: sub.status || "active",
      featured: sub.featured || false,
      sortOrder: sub.sortOrder || 0,
      collectionId: sub.collectionId?.toString() || "",
    });
    setShowForm(true);
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="spinner w-8 h-8" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-[family-name:var(--font-family-heading)] text-2xl font-semibold text-charcoal">Alt Koleksiyonlar</h1>
          <p className="text-sm text-warm-gray-light mt-1">{subs.length} alt koleksiyon</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: "", slug: "", description: "", status: "active", featured: false, sortOrder: 0, collectionId: "" }); }}
          className="btn-primary text-sm">
          + Yeni Alt Koleksiyon
        </button>
      </div>

      {showForm && (
        <div className="admin-card mb-6">
          <h2 className="text-lg font-medium mb-4">{editId ? "Alt Koleksiyon Düzenle" : "Yeni Alt Koleksiyon"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Ad</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="form-input" />
              </div>
              <div>
                <label className="form-label">Ana Koleksiyon</label>
                <select value={form.collectionId} onChange={e => setForm({ ...form, collectionId: e.target.value })} required className="form-input">
                  <option value="">Koleksiyon Seçin</option>
                  {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="form-label">Açıklama</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="form-input" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Durum</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="form-input">
                  <option value="active">Aktif</option>
                  <option value="inactive">Pasif</option>
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
              <th>Ana Koleksiyon</th>
              <th>Durum</th>
              <th>Sıra</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {subs.map(sub => (
              <tr key={sub.id}>
                <td className="font-medium">{sub.name}</td>
                <td className="text-sm text-warm-gray-light">{sub.collectionName || "—"}</td>
                <td>
                  <span className={`badge ${sub.status === "active" ? "badge-success" : "badge-danger"}`}>
                    {sub.status === "active" ? "Aktif" : "Pasif"}
                  </span>
                </td>
                <td>{sub.sortOrder}</td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(sub)} className="text-xs text-bronze hover:underline">Düzenle</button>
                    <button onClick={() => handleDelete(sub.id)} className="text-xs text-red-600 hover:underline">Sil</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {subs.length === 0 && <p className="text-center py-8 text-warm-gray-light">Henüz alt koleksiyon eklenmemiş.</p>}
      </div>
    </div>
  );
}
