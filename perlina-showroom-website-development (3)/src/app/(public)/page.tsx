import { db } from "@/db";
import { homepageSections, collections, subcollections, products, applications, settings, store } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

async function getHomeData() {
  const sections = await db.select().from(homepageSections).orderBy(homepageSections.sortOrder);
  const featuredCols = await db.select().from(collections)
    .where(and(eq(collections.featured, true), eq(collections.status, "active")))
    .orderBy(collections.sortOrder);
  const featuredProds = await db.select().from(products)
    .where(and(eq(products.featured, true), eq(products.status, "active")))
    .orderBy(products.sortOrder)
    .limit(8);
  const activeApps = await db.select().from(applications)
    .where(eq(applications.status, "active"))
    .orderBy(applications.sortOrder)
    .limit(4);
  const allSettings = await db.select().from(settings);
  const settingsMap: Record<string, string> = {};
  for (const s of allSettings) {
    if (s.key && s.value !== null) settingsMap[s.key] = s.value!;
  }
  const [storeData] = await db.select().from(store);

  return { sections, featuredCols, featuredProds, activeApps, settings: settingsMap, store: storeData };
}

function getSection(sections: Array<{ sectionKey: string; title: string | null; subtitle: string | null; description: string | null; ctaText: string | null; ctaUrl: string | null; ctaText2: string | null; ctaUrl2: string | null; imageDesktop: string | null; imageMobile: string | null; isActive: boolean | null }>, key: string) {
  return sections.find(s => s.sectionKey === key);
}

export default async function HomePage() {
  const data = await getHomeData();
  const hero = getSection(data.sections, "hero");
  const fcSection = getSection(data.sections, "featured_collections");
  const fpSection = getSection(data.sections, "featured_products");
  const brandSection = getSection(data.sections, "brand_story");
  const appSection = getSection(data.sections, "applications");
  const ctaSection = getSection(data.sections, "cta");
  const storeCtaSection = getSection(data.sections, "store_cta");
  const whatsapp = data.settings.whatsapp || data.store?.whatsapp || "";
  const waUrl = `https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Merhaba, bilgi almak istiyorum.")}`;

  return (
    <>
      {/* HERO */}
      {hero?.isActive !== false && (
        <section className="relative h-[85vh] min-h-[500px] flex items-center overflow-hidden">
          <div className="absolute inset-0">
            <Image src="/images/hero-desktop.jpg" alt="PERLINA Showroom" fill className="object-cover hidden md:block" priority />
            <Image src="/images/hero-mobile.jpg" alt="PERLINA Showroom" fill className="object-cover md:hidden" priority />
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal/70 via-charcoal/40 to-transparent" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl">
              <div className="w-12 h-px bg-bronze mb-6" />
              <h1 className="font-[family-name:var(--font-family-heading)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-semibold leading-tight mb-4">
                {hero?.title || "Premium Perde & Stor Showroom"}
              </h1>
              <p className="text-white/80 text-base md:text-lg mb-8 leading-relaxed">
                {hero?.description || "PERLINA ile mekanlarınıza zarafet ve şıklık katın."}
              </p>
              <div className="flex flex-wrap gap-4">
                {hero?.ctaText && (
                  <Link href={hero.ctaUrl || "/koleksiyonlar"} className="btn-primary">
                    {hero.ctaText}
                  </Link>
                )}
                {hero?.ctaText2 && (
                  <Link href={hero.ctaUrl2 || "/magazamiz"} className="btn-secondary border-white text-white hover:bg-white hover:text-charcoal">
                    {hero.ctaText2}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FEATURED COLLECTIONS */}
      {fcSection?.isActive !== false && data.featuredCols.length > 0 && (
        <section className="section-padding bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="section-title">{fcSection?.title || "Koleksiyonlarımız"}</h2>
              <p className="section-subtitle">{fcSection?.subtitle || "Her mekan için özenle seçilmiş koleksiyonlar"}</p>
              <div className="w-12 h-px bg-bronze mx-auto mt-4" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.featuredCols.map((col) => (
                <Link key={col.id} href={`/koleksiyon/${col.slug}`} className="group card-hover">
                  <div className="aspect-4/3 bg-cream rounded-lg overflow-hidden mb-4 relative">
                    {col.coverImage ? (
                      <Image src={col.coverImage} alt={col.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cream to-cream-dark">
                        <span className="text-warm-gray-light font-[family-name:var(--font-family-heading)] text-lg">{col.name}</span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-[family-name:var(--font-family-heading)] text-lg font-medium text-charcoal group-hover:text-bronze transition-colors">
                    {col.name}
                  </h3>
                  {col.shortDescription && (
                    <p className="text-sm text-warm-gray-light mt-1 line-clamp-2">{col.shortDescription}</p>
                  )}
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/koleksiyonlar" className="btn-secondary">Tüm Koleksiyonlar</Link>
            </div>
          </div>
        </section>
      )}

      {/* FEATURED PRODUCTS */}
      {fpSection?.isActive !== false && data.featuredProds.length > 0 && (
        <section className="section-padding bg-cream-light">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="section-title">{fpSection?.title || "Öne Çıkan Ürünler"}</h2>
              <p className="section-subtitle">{fpSection?.subtitle || "En beğenilen modellerimiz"}</p>
              <div className="w-12 h-px bg-bronze mx-auto mt-4" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.featuredProds.map((prod) => (
                <Link key={prod.id} href={`/urun/${prod.slug}`} className="group card-hover bg-white rounded-lg overflow-hidden">
                  <div className="aspect-4/3 bg-cream relative">
                    {prod.mainImage ? (
                      <Image src={prod.mainImage} alt={prod.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cream to-cream-dark">
                        <span className="text-warm-gray-light text-sm">{prod.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-charcoal group-hover:text-bronze transition-colors text-sm">
                      {prod.name}
                    </h3>
                    {prod.shortDescription && (
                      <p className="text-xs text-warm-gray-light mt-1 line-clamp-2">{prod.shortDescription}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/urunler" className="btn-secondary">Tüm Ürünler</Link>
            </div>
          </div>
        </section>
      )}

      {/* BRAND STORY */}
      {brandSection?.isActive !== false && (
        <section className="section-padding bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative aspect-4/3 rounded-lg overflow-hidden">
                <Image src={brandSection?.imageDesktop || "/images/brand-story.jpg"} alt="PERLINA Hikayesi" fill className="object-cover" />
              </div>
              <div>
                <div className="w-12 h-px bg-bronze mb-6" />
                <h2 className="section-title mb-6">{brandSection?.title || "PERLINA Hikayesi"}</h2>
                <p className="text-warm-gray leading-relaxed mb-8">
                  {brandSection?.description || "Yılların deneyimi ve tutkusuyla, her pencereye özel çözümler üretiyoruz."}
                </p>
                {brandSection?.ctaText && (
                  <Link href={brandSection.ctaUrl || "/magazamiz"} className="btn-primary">
                    {brandSection.ctaText}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* APPLICATIONS */}
      {appSection?.isActive !== false && data.activeApps.length > 0 && (
        <section className="section-padding bg-cream-light">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="section-title">{appSection?.title || "Uygulamalarımız"}</h2>
              <p className="section-subtitle">{appSection?.subtitle || "Tamamlanan projelerimizden örnekler"}</p>
              <div className="w-12 h-px bg-bronze mx-auto mt-4" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.activeApps.map((app) => (
                <Link key={app.id} href={`/uygulama/${app.slug}`} className="group card-hover bg-white rounded-lg overflow-hidden">
                  <div className="aspect-16/9 bg-cream relative">
                    {app.mainImage ? (
                      <Image src={app.mainImage} alt={app.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cream to-cream-dark">
                        <span className="text-warm-gray-light font-[family-name:var(--font-family-heading)]">{app.title}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-[family-name:var(--font-family-heading)] text-lg font-medium text-charcoal group-hover:text-bronze transition-colors">
                      {app.title}
                    </h3>
                    {app.shortDescription && (
                      <p className="text-sm text-warm-gray-light mt-2 line-clamp-2">{app.shortDescription}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            {appSection?.ctaText && (
              <div className="text-center mt-10">
                <Link href={appSection.ctaUrl || "/uygulamalarimiz"} className="btn-secondary">{appSection.ctaText}</Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA */}
      {ctaSection?.isActive !== false && (
        <section className="section-padding bg-charcoal text-white text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-[family-name:var(--font-family-heading)] text-2xl md:text-4xl font-semibold mb-4">
              {ctaSection?.title || "Hayalinizdeki Perdeyi Birlikte Tasarlayalım"}
            </h2>
            <p className="text-white/70 mb-8">
              {ctaSection?.description || "Showroom'umuzu ziyaret edin veya WhatsApp üzerinden bizimle iletişime geçin."}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.712-1.402A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.24 0-4.31-.726-5.99-1.956l-.418-.314-3.06.91.85-3.108-.327-.437A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                WhatsApp ile İletişim
              </a>
              <Link href="/teklif-al" className="btn-primary bg-bronze hover:bg-bronze-light">
                Teklif Al
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* STORE CTA */}
      {storeCtaSection?.isActive !== false && (
        <section className="relative section-padding overflow-hidden">
          <div className="absolute inset-0">
            <Image src="/images/showroom.jpg" alt="PERLINA Showroom" fill className="object-cover" />
            <div className="absolute inset-0 bg-charcoal/60" />
          </div>
          <div className="relative z-10 max-w-3xl mx-auto text-center text-white">
            <h2 className="font-[family-name:var(--font-family-heading)] text-2xl md:text-4xl font-semibold mb-4">
              {storeCtaSection?.title || "Showroom'umuzu Ziyaret Edin"}
            </h2>
            <p className="text-white/70 mb-8">
              {storeCtaSection?.description || "İstanbul'un merkezinde, 500 m² premium showroom deneyimi sizi bekliyor."}
            </p>
            <Link href={storeCtaSection?.ctaUrl || "/magazamiz"} className="btn-primary bg-white text-charcoal hover:bg-cream">
              {storeCtaSection?.ctaText || "Yol Tarifi Al"}
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
