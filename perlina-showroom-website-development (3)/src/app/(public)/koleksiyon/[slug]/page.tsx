import { db } from "@/db";
import { collections, subcollections, products } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [col] = await db.select().from(collections).where(eq(collections.slug, slug));
  if (!col) return {};
  return {
    title: col.seoTitle || `${col.name} | PERLINA`,
    description: col.metaDescription || col.shortDescription || "",
  };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const [col] = await db.select().from(collections)
    .where(and(eq(collections.slug, slug), eq(collections.status, "active")));
  if (!col) notFound();

  const subs = await db.select().from(subcollections)
    .where(and(eq(subcollections.collectionId, col.id), eq(subcollections.status, "active")))
    .orderBy(subcollections.sortOrder);

  const prods = await db.select().from(products)
    .where(and(eq(products.collectionId, col.id), eq(products.status, "active")))
    .orderBy(products.sortOrder);

  return (
    <>
      {/* Hero */}
      <section className="relative h-64 md:h-80 flex items-center overflow-hidden bg-cream-dark">
        {col.heroImage && (
          <>
            <Image src={col.heroImage} alt={col.name} fill className="object-cover" />
            <div className="absolute inset-0 bg-charcoal/50" />
          </>
        )}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <nav className="text-sm text-white/60 mb-3">
            <Link href="/koleksiyonlar" className="hover:text-white">Koleksiyonlar</Link>
            <span className="mx-2">/</span>
            <span className="text-white">{col.name}</span>
          </nav>
          <h1 className="font-[family-name:var(--font-family-heading)] text-3xl md:text-4xl font-semibold text-white">{col.name}</h1>
        </div>
      </section>

      {/* Description */}
      {col.longDescription && (
        <section className="section-padding pb-8 bg-white">
          <div className="max-w-3xl mx-auto">
            <p className="text-warm-gray leading-relaxed">{col.longDescription}</p>
          </div>
        </section>
      )}

      {/* Subcollections */}
      {subs.length > 0 && (
        <section className="section-padding pt-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="section-title text-2xl mb-8">Alt Koleksiyonlar</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {subs.map((sub) => (
                <Link key={sub.id} href={`/koleksiyon/${col.slug}/${sub.slug}`} className="group card-hover">
                  <div className="aspect-4/3 bg-cream rounded-lg overflow-hidden mb-3 relative">
                    {sub.image ? (
                      <Image src={sub.image} alt={sub.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cream to-cream-dark">
                        <span className="text-warm-gray-light">{sub.name}</span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-[family-name:var(--font-family-heading)] text-lg font-medium text-charcoal group-hover:text-bronze transition-colors">{sub.name}</h3>
                  {sub.description && <p className="text-sm text-warm-gray-light mt-1 line-clamp-2">{sub.description}</p>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products */}
      {prods.length > 0 && (
        <section className="section-padding bg-cream-light">
          <div className="max-w-7xl mx-auto">
            <h2 className="section-title text-2xl mb-8">Ürünler</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {prods.map((prod) => (
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
                    <h3 className="font-medium text-charcoal group-hover:text-bronze transition-colors text-sm">{prod.name}</h3>
                    {prod.shortDescription && <p className="text-xs text-warm-gray-light mt-1 line-clamp-2">{prod.shortDescription}</p>}
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
