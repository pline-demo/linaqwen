"use client";
import { useEffect, useState } from "react";

interface Section {
  id: number;
  sectionKey: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  ctaText: string | null;
  ctaUrl: string | null;
  ctaText2: string | null;
  ctaUrl2: string | null;
  imageDesktop: string | null;
  imageMobile: string | null;
  isActive: boolean | null;
  sortOrder: number | null;
}

const sectionLabels: Record<string, string> = {
  hero: "Hero Bölümü",
  featured_collections: "Öne Çıkan Koleksiyonlar",
  featured_products: "Öne Çıkan Ürünler",
  brand_story: "Marka Hikayesi",
  applications: "Uygulamalar",
  cta: "CTA Bölümü",
  store_cta: "Mağaza CTA",
};

export default function AdminHomepagePage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Section | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/homepage");
    const data = await res.json();
    if (Array.isArray(data)) setSections(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    setSuccess(false);
    
    const res = await fetch("/api/admin/homepage", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    const result = await res.json();
    if (result.success) {
      setSuccess(true);
      load();
      setTimeout(() => setEditing(null), 1500);
    }
    setSaving(false);
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="spinner w-8 h-8" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-family-heading)] text-2xl font-semibold text-charcoal">Ana Sayfa Yönetimi</h1>
        <p className="text-sm text-warm-gray-light mt-1">Ana sayfa bölümlerini düzenleyin</p>
      </div>

      {editing ? (
        <div className="admin-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium">{sectionLabels[editing.sectionKey] || editing.sectionKey}</h2>
            <button onClick={() => setEditing(null)} className="text-warm-gray-light hover:text-charcoal">✕</button>
          </div>

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-sm text-green-700">
              ✓ Bölüm başarıyla güncellendi.
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Başlık</label>
                <input type="text" value={editing.title || ""} onChange={e => setEditing({ ...editing, title: e.target.value })} className="form-input" />
              </div>
              <div>
                <label className="form-label">Alt Başlık</label>
                <input type="text" value={editing.subtitle || ""} onChange={e => setEditing({ ...editing, subtitle: e.target.value })} className="form-input" />
              </div>
            </div>

            <div>
              <label className="form-label">Açıklama</label>
              <textarea value={editing.description || ""} onChange={e => setEditing({ ...editing, description: e.target.value })} rows={3} className="form-input" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Buton 1 Metin</label>
                <input type="text" value={editing.ctaText || ""} onChange={e => setEditing({ ...editing, ctaText: e.target.value })} className="form-input" />
              </div>
              <div>
                <label className="form-label">Buton 1 URL</label>
                <input type="text" value={editing.ctaUrl || ""} onChange={e => setEditing({ ...editing, ctaUrl: e.target.value })} className="form-input" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Buton 2 Metin</label>
                <input type="text" value={editing.ctaText2 || ""} onChange={e => setEditing({ ...editing, ctaText2: e.target.value })} className="form-input" />
              </div>
              <div>
                <label className="form-label">Buton 2 URL</label>
                <input type="text" value={editing.ctaUrl2 || ""} onChange={e => setEditing({ ...editing, ctaUrl2: e.target.value })} className="form-input" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Masaüstü Görsel URL</label>
                <input type="text" value={editing.imageDesktop || ""} onChange={e => setEditing({ ...editing, imageDesktop: e.target.value })} className="form-input" />
              </div>
              <div>
                <label className="form-label">Mobil Görsel URL</label>
                <input type="text" value={editing.imageMobile || ""} onChange={e => setEditing({ ...editing, imageMobile: e.target.value })} className="form-input" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Sıra</label>
                <input type="number" value={editing.sortOrder || 0} onChange={e => setEditing({ ...editing, sortOrder: parseInt(e.target.value) || 0 })} className="form-input" />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editing.isActive !== false} onChange={e => setEditing({ ...editing, isActive: e.target.checked })} className="w-4 h-4" />
                  <span className="text-sm">Aktif</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
              <button onClick={() => setEditing(null)} className="btn-secondary text-sm">İptal</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Bölüm</th>
                <th>Başlık</th>
                <th>Durum</th>
                <th>Sıra</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {sections.map(section => (
                <tr key={section.id}>
                  <td className="font-medium">{sectionLabels[section.sectionKey] || section.sectionKey}</td>
                  <td className="text-sm text-warm-gray-light">{section.title || "—"}</td>
                  <td>
                    <span className={`badge ${section.isActive !== false ? "badge-success" : "badge-danger"}`}>
                      {section.isActive !== false ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td>{section.sortOrder}</td>
                  <td>
                    <button onClick={() => setEditing(section)} className="text-xs text-bronze hover:underline">Düzenle</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
