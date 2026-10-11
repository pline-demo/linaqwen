import { db } from "@/db";
import { products, collections } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ürünler | PERLINA",
  description: "PERLINA premium perde ve stor ürünlerini inceleyin.",
};

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const allProducts = await db.select({
    id: products.id, name: products.name, slug: products.slug,
    shortDescription: products.shortDescription, mainImage: products.mainImage,
    collectionName: collections.name, collectionSlug: collections.slug
  }).from(products)
    .leftJoin(collections, eq(products.collectionId, collections.id))
    .where(eq(products.status, "active"))
    .orderBy(products.sortOrder);

  return (
    <>
      <section className="bg-cream-light section-padding pb-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="w-12 h-px bg-bronze mx-auto mb-6" />
          <h1 className="section-title text-3xl md:text-4xl">Ürünler</h1>
          <p className="section-subtitle max-w-2xl mx-auto mt-4">
            Premium perde ve stor ürünlerimizi inceleyin.
          </p>
        </div>
      </section>

      <section className="section-padding pt-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {allProducts.map((prod) => (
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
                  {prod.collectionName && (
                    <span className="text-xs text-bronze font-medium uppercase tracking-wider">{prod.collectionName}</span>
                  )}
                  <h3 className="font-medium text-charcoal group-hover:text-bronze transition-colors text-sm mt-1">{prod.name}</h3>
                  {prod.shortDescription && <p className="text-xs text-warm-gray-light mt-1 line-clamp-2">{prod.shortDescription}</p>}
                </div>
              </Link>
            ))}
          </div>
          {allProducts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-warm-gray-light">Henüz ürün eklenmemiş.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
