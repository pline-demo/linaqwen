import { db } from "@/db";
import { applications } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Uygulamalarımız | PERLINA",
  description: "PERLINA tamamlanmış proje ve uygulamalarını görüntüleyin.",
};

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const apps = await db.select().from(applications)
    .where(eq(applications.status, "active"))
    .orderBy(applications.sortOrder);

  return (
    <>
      <section className="bg-cream-light section-padding pb-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="w-12 h-px bg-bronze mx-auto mb-6" />
          <h1 className="section-title text-3xl md:text-4xl">Uygulamalarımız</h1>
          <p className="section-subtitle max-w-2xl mx-auto mt-4">
            Tamamlanan projelerimizden seçme örnekler.
          </p>
        </div>
      </section>

      <section className="section-padding pt-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {apps.map((app) => (
              <Link key={app.id} href={`/uygulama/${app.slug}`} className="group card-hover bg-cream-light rounded-lg overflow-hidden">
                <div className="aspect-16/9 bg-cream relative">
                  {app.mainImage ? (
                    <Image src={app.mainImage} alt={app.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cream to-cream-dark">
                      <span className="font-[family-name:var(--font-family-heading)] text-lg text-warm-gray-light">{app.title}</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h2 className="font-[family-name:var(--font-family-heading)] text-xl font-medium text-charcoal group-hover:text-bronze transition-colors">{app.title}</h2>
                  {app.shortDescription && (
                    <p className="text-sm text-warm-gray mt-2 line-clamp-2">{app.shortDescription}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
          {apps.length === 0 && (
            <div className="text-center py-16">
              <p className="text-warm-gray-light">Henüz uygulama eklenmemiş.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
