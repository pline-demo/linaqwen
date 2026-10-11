"use client";
import { useEffect, useState } from "react";

interface StoreData {
  id?: number;
  name: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  workingHours: string;
  mapLat: string;
  mapLng: string;
  mapZoom: number;
  mapEmbedUrl: string;
  description: string;
  heroImage: string;
  exteriorImage: string;
  interiorImage: string;
}

const defaultStore: StoreData = {
  name: "", address: "", phone: "", whatsapp: "", email: "",
  workingHours: "", mapLat: "", mapLng: "", mapZoom: 15,
  mapEmbedUrl: "", description: "", heroImage: "", exteriorImage: "", interiorImage: ""
};

export default function AdminStorePage() {
  const [data, setData] = useState<StoreData>(defaultStore);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/admin/store")
      .then(r => r.json())
      .then(d => { setData({ ...defaultStore, ...d }); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSuccess(false);
    const res = await fetch("/api/admin/store", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) setSuccess(true);
    setSaving(false);
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="spinner w-8 h-8" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-[family-name:var(--font-family-heading)] text-2xl font-semibold text-charcoal">Mağaza Bilgileri</h1>
          <p className="text-sm text-warm-gray-light mt-1">Showroom bilgilerini düzenleyin</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6 text-sm text-green-700">
          ✓ Mağaza bilgileri başarıyla kaydedildi.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temel Bilgiler */}
        <div className="admin-card">
          <h2 className="text-lg font-medium text-charcoal mb-4">Temel Bilgiler</h2>
          <div className="space-y-4">
            <div>
              <label className="form-label">Mağaza Adı</label>
              <input type="text" value={data.name} onChange={e => setData({ ...data, name: e.target.value })} className="form-input" />
            </div>
            <div>
              <label className="form-label">Açıklama</label>
              <textarea value={data.description} onChange={e => setData({ ...data, description: e.target.value })} rows={3} className="form-input" />
            </div>
            <div>
              <label className="form-label">Adres</label>
              <textarea value={data.address} onChange={e => setData({ ...data, address: e.target.value })} rows={2} className="form-input" />
            </div>
            <div>
              <label className="form-label">Çalışma Saatleri</label>
              <textarea value={data.workingHours} onChange={e => setData({ ...data, workingHours: e.target.value })} rows={2} className="form-input" placeholder="Pazartesi - Cumartesi: 09:00 - 19:00" />
            </div>
          </div>
        </div>

        {/* İletişim */}
        <div className="admin-card">
          <h2 className="text-lg font-medium text-charcoal mb-4">İletişim</h2>
          <div className="space-y-4">
            <div>
              <label className="form-label">Telefon</label>
              <input type="tel" value={data.phone} onChange={e => setData({ ...data, phone: e.target.value })} className="form-input" placeholder="+90 212 555 0000" />
            </div>
            <div>
              <label className="form-label">WhatsApp Numarası</label>
              <input type="text" value={data.whatsapp} onChange={e => setData({ ...data, whatsapp: e.target.value })} className="form-input" placeholder="905325550000" />
              <p className="text-xs text-warm-gray-light mt-1">Başında 90 ile, boşluksuz yazın</p>
            </div>
            <div>
              <label className="form-label">E-posta</label>
              <input type="email" value={data.email} onChange={e => setData({ ...data, email: e.target.value })} className="form-input" />
            </div>
          </div>
        </div>

        {/* Harita */}
        <div className="admin-card">
          <h2 className="text-lg font-medium text-charcoal mb-4">Google Maps</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Enlem (Lat)</label>
                <input type="text" value={data.mapLat} onChange={e => setData({ ...data, mapLat: e.target.value })} className="form-input" placeholder="41.0668" />
              </div>
              <div>
                <label className="form-label">Boylam (Lng)</label>
                <input type="text" value={data.mapLng} onChange={e => setData({ ...data, mapLng: e.target.value })} className="form-input" placeholder="28.7936" />
              </div>
            </div>
            <div>
              <label className="form-label">Harita Embed URL</label>
              <textarea value={data.mapEmbedUrl} onChange={e => setData({ ...data, mapEmbedUrl: e.target.value })} rows={3} className="form-input" placeholder="https://www.google.com/maps/embed?pb=..." />
              <p className="text-xs text-warm-gray-light mt-1">Google Maps &gt; Paylaş &gt; Harita yerleştir &gt; src URL&apos;sini yapıştırın</p>
            </div>
          </div>
        </div>

        {/* Görseller */}
        <div className="admin-card">
          <h2 className="text-lg font-medium text-charcoal mb-4">Görseller</h2>
          <div className="space-y-4">
            <div>
              <label className="form-label">Hero Görsel URL</label>
              <input type="text" value={data.heroImage} onChange={e => setData({ ...data, heroImage: e.target.value })} className="form-input" placeholder="/images/showroom.jpg" />
            </div>
            <div>
              <label className="form-label">Dış Mekan Görsel URL</label>
              <input type="text" value={data.exteriorImage} onChange={e => setData({ ...data, exteriorImage: e.target.value })} className="form-input" />
            </div>
            <div>
              <label className="form-label">İç Mekan Görsel URL</label>
              <input type="text" value={data.interiorImage} onChange={e => setData({ ...data, interiorImage: e.target.value })} className="form-input" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
