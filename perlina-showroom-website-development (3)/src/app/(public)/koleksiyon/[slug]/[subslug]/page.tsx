import { db } from "@/db";
import { collections, subcollections, products } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string; subslug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, subslug } = await params;
  const [col] = await db.select().from(collections).where(eq(collections.slug, slug));
  if (!col) return {};
  const [sub] = await db.select().from(subcollections).where(and(eq(subcollections.collectionId, col.id), eq(subcollections.slug, subslug)));
  if (!sub) return {};
  return {
    title: sub.seoTitle || `${sub.name} - ${col.name} | PERLINA`,
    description: sub.metaDescription || sub.description || "",
  };
}

export default async function SubcollectionPage({ params }: Props) {
  const { slug, subslug } = await params;
  const [col] = await db.select().from(collections).where(and(eq(collections.slug, slug), eq(collections.status, "active")));
  if (!col) notFound();
  const [sub] = await db.select().from(subcollections).where(and(eq(subcollections.collectionId, col.id), eq(subcollections.slug, subslug), eq(subcollections.status, "active")));
  if (!sub) notFound();

  const prods = await db.select().from(products)
    .where(and(eq(products.subcollectionId, sub.id), eq(products.status, "active")))
    .orderBy(products.sortOrder);

  return (
    <>
      <section className="relative h-64 md:h-80 flex items-center overflow-hidden bg-cream-dark">
        {sub.image && (
          <>
            <Image src={sub.image} alt={sub.name} fill className="object-cover" />
            <div className="absolute inset-0 bg-charcoal/50" />
          </>
        )}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <nav className="text-sm text-white/60 mb-3">
            <Link href="/koleksiyonlar" className="hover:text-white">Koleksiyonlar</Link>
            <span className="mx-2">/</span>
            <Link href={`/koleksiyon/${col.slug}`} className="hover:text-white">{col.name}</Link>
            <span className="mx-2">/</span>
            <span className="text-white">{sub.name}</span>
          </nav>
          <h1 className="font-[family-name:var(--font-family-heading)] text-3xl md:text-4xl font-semibold text-white">{sub.name}</h1>
        </div>
      </section>

      {sub.description && (
        <section className="section-padding pb-8 bg-white">
          <div className="max-w-3xl mx-auto">
            <p className="text-warm-gray leading-relaxed">{sub.description}</p>
          </div>
        </section>
      )}

      <section className="section-padding pt-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {prods.map((prod) => (
              <Link key={prod.id} href={`/urun/${prod.slug}`} className="group card-hover bg-cream-light rounded-lg overflow-hidden">
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
          {prods.length === 0 && (
            <div className="text-center py-16">
              <p className="text-warm-gray-light">Bu alt koleksiyonda henüz ürün bulunmuyor.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
