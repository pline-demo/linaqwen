import { db } from "@/db";
import { collections } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Koleksiyonlar | PERLINA",
  description: "PERLINA premium perde koleksiyonlarını keşfedin. Tül perde, fon perde, stor perde, zebra perde ve daha fazlası.",
};

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const cols = await db.select().from(collections)
    .where(eq(collections.status, "active"))
    .orderBy(collections.sortOrder);

  return (
    <>
      {/* Page Hero */}
      <section className="bg-cream-light section-padding pb-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="w-12 h-px bg-bronze mx-auto mb-6" />
          <h1 className="section-title text-3xl md:text-4xl">Koleksiyonlar</h1>
          <p className="section-subtitle max-w-2xl mx-auto mt-4">
            Premium perde ve stor çözümlerimizi keşfedin. Her mekan için özenle seçilmiş koleksiyonlar.
          </p>
        </div>
      </section>

      <section className="section-padding pt-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {cols.map((col) => (
              <Link key={col.id} href={`/koleksiyon/${col.slug}`} className="group card-hover">
                <div className="aspect-4/3 bg-cream rounded-lg overflow-hidden mb-4 relative">
                  {col.coverImage ? (
                    <Image src={col.coverImage} alt={col.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cream to-cream-dark">
                      <span className="font-[family-name:var(--font-family-heading)] text-xl text-warm-gray-light">{col.name}</span>
                    </div>
                  )}
                </div>
                <h2 className="font-[family-name:var(--font-family-heading)] text-xl font-medium text-charcoal group-hover:text-bronze transition-colors">
                  {col.name}
                </h2>
                {col.shortDescription && (
                  <p className="text-sm text-warm-gray mt-2 line-clamp-2">{col.shortDescription}</p>
                )}
              </Link>
            ))}
          </div>
          {cols.length === 0 && (
            <div className="text-center py-16">
              <p className="text-warm-gray-light">Henüz koleksiyon eklenmemiş.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
