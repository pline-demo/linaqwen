import { db } from "@/db";
import { products, collections, subcollections, productImages, settings } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [prod] = await db.select().from(products).where(eq(products.slug, slug));
  if (!prod) return {};
  return {
    title: prod.seoTitle || `${prod.name} | PERLINA`,
    description: prod.metaDescription || prod.shortDescription || "",
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [prod] = await db.select().from(products).where(and(eq(products.slug, slug), eq(products.status, "active")));
  if (!prod) notFound();

  const gallery = await db.select().from(productImages).where(eq(productImages.productId, prod.id)).orderBy(productImages.sortOrder);

  let col = null;
  if (prod.collectionId) {
    const [c] = await db.select().from(collections).where(eq(collections.id, prod.collectionId));
    col = c || null;
  }

  let sub = null;
  if (prod.subcollectionId) {
    const [s] = await db.select().from(subcollections).where(eq(subcollections.id, prod.subcollectionId));
    sub = s || null;
  }

  // Related products
  const related = prod.collectionId
    ? await db.select().from(products).where(and(eq(products.collectionId, prod.collectionId), eq(products.status, "active"))).limit(4)
    : [];

  const allSettings = await db.select().from(settings);
  const sMap: Record<string, string> = {};
  for (const s of allSettings) { if (s.key && s.value) sMap[s.key] = s.value; }
  const whatsapp = sMap.whatsapp || "";
  const waUrl = `https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Merhaba, ${prod.name} hakkında bilgi almak istiyorum.`)}`;

  return (
    <>
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="text-sm text-warm-gray-light mb-6">
            <Link href="/urunler" className="hover:text-charcoal">Ürünler</Link>
            {col && (
              <>
                <span className="mx-2">/</span>
                <Link href={`/koleksiyon/${col.slug}`} className="hover:text-charcoal">{col.name}</Link>
              </>
            )}
            {sub && col && (
              <>
                <span className="mx-2">/</span>
                <Link href={`/koleksiyon/${col.slug}/${sub.slug}`} className="hover:text-charcoal">{sub.name}</Link>
              </>
            )}
            <span className="mx-2">/</span>
            <span className="text-charcoal">{prod.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image */}
            <div>
              <div className="aspect-4/3 bg-cream rounded-lg overflow-hidden relative mb-4">
                {prod.mainImage ? (
                  <Image src={prod.mainImage} alt={prod.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cream to-cream-dark">
                    <span className="text-warm-gray-light font-[family-name:var(--font-family-heading)] text-xl">{prod.name}</span>
                  </div>
                )}
              </div>
              {gallery.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {gallery.map((img) => (
                    <div key={img.id} className="aspect-square bg-cream rounded overflow-hidden relative">
                      <Image src={img.imagePath} alt={img.altText || prod.name} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              {col && (
                <span className="text-xs text-bronze font-medium uppercase tracking-widest">{col.name}</span>
              )}
              <h1 className="font-[family-name:var(--font-family-heading)] text-2xl md:text-3xl font-semibold text-charcoal mt-2 mb-4">{prod.name}</h1>
              <div className="w-12 h-px bg-bronze mb-6" />
              {prod.shortDescription && (
                <p className="text-warm-gray leading-relaxed mb-6">{prod.shortDescription}</p>
              )}
              {prod.longDescription && (
                <div className="text-warm-gray leading-relaxed mb-8 whitespace-pre-line">{prod.longDescription}</div>
              )}

              <div className="flex flex-wrap gap-4">
                <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.712-1.402A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.24 0-4.31-.726-5.99-1.956l-.418-.314-3.06.91.85-3.108-.327-.437A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                  Bilgi Al
                </a>
                <Link href={`/teklif-al?urun=${encodeURIComponent(prod.name)}&kod=${encodeURIComponent(prod.slug)}`} className="btn-primary">Teklif Al</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {related.filter(r => r.id !== prod.id).length > 0 && (
        <section className="section-padding bg-cream-light">
          <div className="max-w-7xl mx-auto">
            <h2 className="section-title text-2xl mb-8">İlgili Ürünler</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.filter(r => r.id !== prod.id).slice(0, 4).map((r) => (
                <Link key={r.id} href={`/urun/${r.slug}`} className="group card-hover bg-white rounded-lg overflow-hidden">
                  <div className="aspect-4/3 bg-cream relative">
                    {r.mainImage ? (
                      <Image src={r.mainImage} alt={r.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cream to-cream-dark">
                        <span className="text-warm-gray-light text-sm">{r.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-charcoal group-hover:text-bronze transition-colors text-sm">{r.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
