import { db } from "@/db";
import { store as storeTable } from "@/db/schema";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mağazamız | PERLINA",
  description: "PERLINA premium perde showroom'unu ziyaret edin. Adres, çalışma saatleri ve yol tarifi.",
};

export const dynamic = "force-dynamic";

export default async function StorePage() {
  const [s] = await db.select().from(storeTable);
  const waUrl = s?.whatsapp ? `https://wa.me/${s.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Merhaba, showroom hakkında bilgi almak istiyorum.")}` : "#";
  const mapsUrl = s?.mapLat && s?.mapLng ? `https://www.google.com/maps/dir/?api=1&destination=${s.mapLat},${s.mapLng}` : "#";

  return (
    <>
      {/* Hero */}
      <section className="relative h-64 md:h-96 flex items-center overflow-hidden bg-cream-dark">
        <Image src={s?.heroImage || "/images/showroom.jpg"} alt="PERLINA Showroom" fill className="object-cover" />
        <div className="absolute inset-0 bg-charcoal/50" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
          <h1 className="font-[family-name:var(--font-family-heading)] text-3xl md:text-5xl font-semibold text-white">Mağazamız</h1>
          <p className="text-white/70 mt-3 text-lg">Premium perde showroom deneyimi</p>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Info */}
            <div>
              <div className="w-12 h-px bg-bronze mb-6" />
              <h2 className="section-title text-2xl mb-6">{s?.name || "PERLINA Showroom"}</h2>
              {s?.description && (
                <p className="text-warm-gray leading-relaxed mb-8">{s.description}</p>
              )}

              <div className="space-y-6">
                {s?.address && (
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-bronze" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-charcoal text-sm mb-1">Adres</h3>
                      <p className="text-warm-gray text-sm">{s.address}</p>
                    </div>
                  </div>
                )}

                {s?.phone && (
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-bronze" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-charcoal text-sm mb-1">Telefon</h3>
                      <a href={`tel:${s.phone}`} className="text-warm-gray text-sm hover:text-bronze">{s.phone}</a>
                    </div>
                  </div>
                )}

                {s?.whatsapp && (
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-charcoal text-sm mb-1">WhatsApp</h3>
                      <a href={waUrl} target="_blank" rel="noopener noreferrer" className="text-green-600 text-sm hover:underline">WhatsApp ile İletişim</a>
                    </div>
                  </div>
                )}

                {s?.email && (
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-bronze" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-charcoal text-sm mb-1">E-posta</h3>
                      <a href={`mailto:${s.email}`} className="text-warm-gray text-sm hover:text-bronze">{s.email}</a>
                    </div>
                  </div>
                )}

                {s?.workingHours && (
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-bronze" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-charcoal text-sm mb-1">Çalışma Saatleri</h3>
                      <p className="text-warm-gray text-sm whitespace-pre-line">{s.workingHours}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">Yol Tarifi Al</a>
                <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">WhatsApp</a>
              </div>
            </div>

            {/* Map */}
            <div className="rounded-lg overflow-hidden bg-cream min-h-[400px]">
              {s?.mapEmbedUrl ? (
                <iframe src={s.mapEmbedUrl} width="100%" height="100%" style={{ border: 0, minHeight: 400 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="PERLINA Showroom Konum" />
              ) : (
                <div className="w-full h-full flex items-center justify-center min-h-[400px]">
                  <p className="text-warm-gray-light">Harita bilgisi henüz eklenmemiş.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
