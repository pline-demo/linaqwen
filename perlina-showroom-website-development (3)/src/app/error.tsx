"use client";
import Link from "next/link";

export default function Error() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-light p-4">
      <div className="text-center max-w-md">
        <h1 className="font-[family-name:var(--font-family-heading)] text-6xl font-semibold text-charcoal mb-2">500</h1>
        <div className="w-12 h-px bg-bronze mx-auto mb-6" />
        <h2 className="text-xl font-medium text-charcoal mb-3">Sunucu Hatası</h2>
        <p className="text-warm-gray mb-8">
          Bir hata oluştu. Lütfen daha sonra tekrar deneyin.
        </p>
        <Link href="/" className="btn-primary">
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}
