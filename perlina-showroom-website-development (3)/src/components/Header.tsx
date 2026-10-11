"use client";
import { useState } from "react";
import Link from "next/link";

export default function Header({ whatsapp }: { whatsapp?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const waUrl = whatsapp ? `https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Merhaba, bilgi almak istiyorum.")}` : "#";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-cream-dark/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="font-[family-name:var(--font-family-heading)] text-2xl md:text-3xl font-semibold tracking-wider text-charcoal">
              PERLINA
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link href="/koleksiyonlar" className="text-sm font-medium text-warm-gray hover:text-charcoal transition-colors tracking-wide uppercase">
              Koleksiyonlar
            </Link>
            <Link href="/urunler" className="text-sm font-medium text-warm-gray hover:text-charcoal transition-colors tracking-wide uppercase">
              Ürünler
            </Link>
            <Link href="/uygulamalarimiz" className="text-sm font-medium text-warm-gray hover:text-charcoal transition-colors tracking-wide uppercase">
              Uygulamalarımız
            </Link>
            <Link href="/magazamiz" className="text-sm font-medium text-warm-gray hover:text-charcoal transition-colors tracking-wide uppercase">
              Mağazamız
            </Link>
            <Link href="/iletisim" className="text-sm font-medium text-warm-gray hover:text-charcoal transition-colors tracking-wide uppercase">
              İletişim
            </Link>
          </nav>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <a href={waUrl} target="_blank" rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-charcoal text-white text-xs font-medium tracking-widest uppercase hover:bg-bronze transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.712-1.402A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.24 0-4.31-.726-5.99-1.956l-.418-.314-3.06.91.85-3.108-.327-.437A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
              Teklif Al
            </a>
            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 text-charcoal" aria-label="Menü">
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-cream-dark/30">
          <nav className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-4">
            <Link href="/koleksiyonlar" onClick={() => setMenuOpen(false)} className="text-base font-medium text-charcoal tracking-wide">Koleksiyonlar</Link>
            <Link href="/urunler" onClick={() => setMenuOpen(false)} className="text-base font-medium text-charcoal tracking-wide">Ürünler</Link>
            <Link href="/uygulamalarimiz" onClick={() => setMenuOpen(false)} className="text-base font-medium text-charcoal tracking-wide">Uygulamalarımız</Link>
            <Link href="/magazamiz" onClick={() => setMenuOpen(false)} className="text-base font-medium text-charcoal tracking-wide">Mağazamız</Link>
            <Link href="/iletisim" onClick={() => setMenuOpen(false)} className="text-base font-medium text-charcoal tracking-wide">İletişim</Link>
            <Link href="/teklif-al" onClick={() => setMenuOpen(false)} className="text-base font-medium text-charcoal tracking-wide">Teklif Al</Link>
            <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-2 w-full justify-center">
              WhatsApp ile İletişim
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
