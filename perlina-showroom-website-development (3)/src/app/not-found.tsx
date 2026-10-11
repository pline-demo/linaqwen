import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-light p-4">
      <div className="text-center max-w-md">
        <h1 className="font-[family-name:var(--font-family-heading)] text-6xl font-semibold text-charcoal mb-2">404</h1>
        <div className="w-12 h-px bg-bronze mx-auto mb-6" />
        <h2 className="text-xl font-medium text-charcoal mb-3">Sayfa Bulunamadı</h2>
        <p className="text-warm-gray mb-8">
          Aradığınız sayfa mevcut değil veya kaldırılmış olabilir.
        </p>
        <Link href="/" className="btn-primary">
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}
