"use client";
import { useState, FormEvent } from "react";

interface QuoteFormProps {
  whatsapp: string;
  productName?: string;
  productCode?: string;
}

export default function QuoteForm({ whatsapp, productName, productCode }: QuoteFormProps) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    width: "",
    height: "",
    description: "",
    product: productName || "",
    code: productCode || "",
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // Build WhatsApp message
    let message = `Merhaba, teklif almak istiyorum.\n\n`;
    message += `👤 Ad Soyad: ${form.name}\n`;
    message += `📱 Telefon: ${form.phone}\n`;
    
    if (form.product) {
      message += `\n🏷️ Ürün: ${form.product}\n`;
    }
    if (form.code) {
      message += `📋 Ürün Kodu: ${form.code}\n`;
    }
    if (form.width || form.height) {
      message += `\n📐 Ölçüler:\n`;
      if (form.width) message += `   En: ${form.width} cm\n`;
      if (form.height) message += `   Boy: ${form.height} cm\n`;
    }
    if (form.description) {
      message += `\n📝 Açıklama:\n${form.description}\n`;
    }

    // Clean phone and redirect to WhatsApp
    const cleanPhone = whatsapp.replace(/[^0-9]/g, "");
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    
    window.open(waUrl, "_blank");
  }

  return (
    <div className="bg-cream-light rounded-2xl p-6 md:p-8">
      {/* Product info if coming from product page */}
      {(form.product || form.code) && (
        <div className="bg-white rounded-xl p-4 mb-6 border border-cream-dark">
          <p className="text-xs text-bronze font-medium uppercase tracking-wider mb-1">Seçili Ürün</p>
          <p className="font-medium text-charcoal">{form.product || "—"}</p>
          {form.code && <p className="text-sm text-warm-gray-light mt-1">Kod: {form.code}</p>}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Ad Soyad - Required */}
        <div>
          <label htmlFor="name" className="form-label">
            Ad Soyad <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
            className="form-input"
            placeholder="Adınız ve soyadınız"
          />
        </div>

        {/* Telefon - Required */}
        <div>
          <label htmlFor="phone" className="form-label">
            Telefon <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            required
            className="form-input"
            placeholder="05XX XXX XX XX"
          />
        </div>

        {/* Ölçüler */}
        <div>
          <label className="form-label">Ölçüler (cm)</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                value={form.width}
                onChange={e => setForm({ ...form, width: e.target.value })}
                className="form-input"
                placeholder="En"
              />
            </div>
            <div>
              <input
                type="text"
                value={form.height}
                onChange={e => setForm({ ...form, height: e.target.value })}
                className="form-input"
                placeholder="Boy"
              />
            </div>
          </div>
          <p className="text-xs text-warm-gray-light mt-1">Opsiyonel - Pencerenizin ölçülerini girebilirsiniz</p>
        </div>

        {/* Ürün Kodu - if not pre-filled */}
        {!productCode && (
          <div>
            <label htmlFor="code" className="form-label">Ürün Kodu</label>
            <input
              type="text"
              id="code"
              value={form.code}
              onChange={e => setForm({ ...form, code: e.target.value })}
              className="form-input"
              placeholder="Varsa ürün kodunu yazın"
            />
          </div>
        )}

        {/* Açıklama */}
        <div>
          <label htmlFor="description" className="form-label">Açıklama</label>
          <textarea
            id="description"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="form-input"
            placeholder="Eklemek istediğiniz notlar, özel istekler..."
          />
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn-whatsapp w-full justify-center text-base py-4">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.712-1.402A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.24 0-4.31-.726-5.99-1.956l-.418-.314-3.06.91.85-3.108-.327-.437A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
          </svg>
          WhatsApp ile Teklif Al
        </button>

        <p className="text-center text-xs text-warm-gray-light">
          Butona tıkladığınızda WhatsApp açılacak ve bilgileriniz mesaj olarak hazırlanacak.
        </p>
      </form>
    </div>
  );
}
