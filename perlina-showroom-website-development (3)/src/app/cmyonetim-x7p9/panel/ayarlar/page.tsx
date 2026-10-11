"use client";
import { useEffect, useState } from "react";

interface Setting {
  id: number;
  key: string;
  value: string | null;
  group: string | null;
}

export default function AdminSettingsPage() {
  const [allSettings, setAllSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [maintenance, setMaintenance] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/settings");
    const data = await res.json();
    if (Array.isArray(data)) {
      setAllSettings(data);
      const mm = data.find((s: Setting) => s.key === "maintenance_mode");
      setMaintenance(mm?.value === "true");
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function getValue(key: string): string {
    return allSettings.find(s => s.key === key)?.value || "";
  }

  function setValue(key: string, value: string) {
    setAllSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
  }

  async function handleSave() {
    setSaving(true);
    setSuccess(false);
    const entries = allSettings.map(s => ({ key: s.key, value: s.value || "", group: s.group || "general" }));
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings: entries }),
    });
    const data = await res.json();
    if (data.success) setSuccess(true);
    setSaving(false);
  }

  async function toggleMaintenance() {
    const enabled = !maintenance;
    await fetch("/api/admin/maintenance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    });
    setMaintenance(enabled);
    setValue("maintenance_mode", enabled ? "true" : "false");
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="spinner w-8 h-8" /></div>;

  const groups = [
    { title: "Genel", keys: ["site_name", "site_description"] },
    { title: "İletişim", keys: ["phone", "email", "whatsapp", "address"] },
    { title: "Sosyal Medya", keys: ["instagram", "facebook"] },
    { title: "SEO", keys: ["default_seo_title", "default_meta_description"] },
  ];

  const keyLabels: Record<string, string> = {
    site_name: "Site Adı", site_description: "Site Açıklaması",
    phone: "Telefon", email: "E-posta", whatsapp: "WhatsApp Numarası", address: "Adres",
    instagram: "Instagram URL", facebook: "Facebook URL",
    default_seo_title: "Varsayılan SEO Başlık", default_meta_description: "Varsayılan Meta Açıklama",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-[family-name:var(--font-family-heading)] text-2xl font-semibold text-charcoal">Ayarlar</h1>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6 text-sm text-green-700">
          Ayarlar başarıyla kaydedildi.
        </div>
      )}

      {/* Maintenance */}
      <div className="admin-card mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-charcoal">Bakım Modu</h2>
            <p className="text-sm text-warm-gray-light mt-1">Bakım modu aktif olduğunda ziyaretçiler bakım sayfasını görür.</p>
          </div>
          <button onClick={toggleMaintenance}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${maintenance ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-green-100 text-green-700 hover:bg-green-200"}`}>
            {maintenance ? "Bakım Modunu Kapat" : "Bakım Modunu Aç"}
          </button>
        </div>
        {maintenance && (
          <div className="mt-3 p-3 bg-red-50 rounded text-sm text-red-700">
            ⚠️ Bakım modu aktif. Ziyaretçiler web sitesine erişemiyor.
          </div>
        )}
      </div>

      {groups.map(group => (
        <div key={group.title} className="admin-card mb-6">
          <h2 className="text-lg font-medium text-charcoal mb-4">{group.title}</h2>
          <div className="space-y-4">
            {group.keys.map(key => (
              <div key={key}>
                <label className="form-label">{keyLabels[key] || key}</label>
                {key.includes("description") ? (
                  <textarea value={getValue(key)} onChange={e => setValue(key, e.target.value)} rows={2} className="form-input" />
                ) : (
                  <input type="text" value={getValue(key)} onChange={e => setValue(key, e.target.value)} className="form-input" />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
