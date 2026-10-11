"use client";
import { useState, FormEvent } from "react";

export default function ContactForm({ relatedProduct, relatedCollection }: { relatedProduct?: string; relatedCollection?: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          phone: data.get("phone"),
          email: data.get("email"),
          subject: data.get("subject"),
          message: data.get("message"),
          relatedProduct: relatedProduct || "",
          relatedCollection: relatedCollection || "",
        }),
      });

      const result = await res.json();
      if (result.success) {
        setSuccess(true);
        form.reset();
      } else {
        setError(result.error || "Bir hata oluştu. Lütfen tekrar deneyin.");
      }
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-medium text-green-800 mb-2">Mesajınız Alındı</h3>
        <p className="text-sm text-green-600">En kısa sürede sizinle iletişime geçeceğiz.</p>
        <button onClick={() => setSuccess(false)} className="mt-4 text-sm text-green-700 underline">Yeni mesaj gönder</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="form-label">Ad Soyad *</label>
        <input type="text" id="name" name="name" required className="form-input" placeholder="Adınız ve soyadınız" />
      </div>

      <div>
        <label htmlFor="phone" className="form-label">Telefon *</label>
        <input type="tel" id="phone" name="phone" required className="form-input" placeholder="05XX XXX XX XX" />
      </div>

      <div>
        <label htmlFor="email" className="form-label">E-posta</label>
        <input type="email" id="email" name="email" className="form-input" placeholder="ornek@email.com" />
      </div>

      <div>
        <label htmlFor="subject" className="form-label">Konu</label>
        <select id="subject" name="subject" className="form-input">
          <option value="">Konu seçin</option>
          <option value="Bilgi Talebi">Bilgi Talebi</option>
          <option value="Teklif Talebi">Teklif Talebi</option>
          <option value="Showroom Randevu">Showroom Randevu</option>
          <option value="Diğer">Diğer</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="form-label">Mesajınız *</label>
        <textarea id="message" name="message" required rows={5} className="form-input" placeholder="Mesajınızı yazın..." />
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="spinner" />
            Gönderiliyor...
          </span>
        ) : (
          "Gönder"
        )}
      </button>
    </form>
  );
}
