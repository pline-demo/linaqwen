"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/cmyonetim-x7p9/panel");
      } else {
        setError(data.error || "Giriş başarısız.");
      }
    } catch {
      setError("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-charcoal to-warm-gray-dark p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="font-[family-name:var(--font-family-heading)] text-3xl font-semibold text-charcoal tracking-wider">PERLINA</h1>
            <div className="w-10 h-px bg-bronze mx-auto mt-3" />
            <p className="text-sm text-warm-gray-light mt-3">Yönetim Paneli</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-5 text-sm text-red-700 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="form-label">Kullanıcı Adı</label>
              <input type="text" id="username" value={username} onChange={e => setUsername(e.target.value)}
                required className="form-input" placeholder="Kullanıcı adınız" autoComplete="username" />
            </div>
            <div>
              <label htmlFor="password" className="form-label">Şifre</label>
              <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)}
                required className="form-input" placeholder="••••••••" autoComplete="current-password" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-white/30 mt-6">© {new Date().getFullYear()} PERLINA</p>
      </div>
    </div>
  );
}
