import { db } from "@/db";
import { applications, applicationImages, settings } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [app] = await db.select().from(applications).where(eq(applications.slug, slug));
  if (!app) return {};
  return {
    title: app.seoTitle || `${app.title} | PERLINA`,
    description: app.metaDescription || app.shortDescription || "",
  };
}

export default async function ApplicationPage({ params }: Props) {
  const { slug } = await params;
  const [app] = await db.select().from(applications).where(and(eq(applications.slug, slug), eq(applications.status, "active")));
  if (!app) notFound();

  const gallery = await db.select().from(applicationImages).where(eq(applicationImages.applicationId, app.id)).orderBy(applicationImages.sortOrder);

  const allSettings = await db.select().from(settings);
  const sMap: Record<string, string> = {};
  for (const s of allSettings) { if (s.key && s.value) sMap[s.key] = s.value; }
  const whatsapp = sMap.whatsapp || "";
  const waUrl = `https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Merhaba, ${app.title} projesi hakkında bilgi almak istiyorum.`)}`;

  return (
    <>
      <section className="section-padding bg-white">
        <div className="max-w-5xl mx-auto">
          <nav className="text-sm text-warm-gray-light mb-6">
            <Link href="/uygulamalarimiz" className="hover:text-charcoal">Uygulamalarımız</Link>
            <span className="mx-2">/</span>
            <span className="text-charcoal">{app.title}</span>
          </nav>

          <div className="aspect-16/9 bg-cream rounded-lg overflow-hidden relative mb-8">
            {app.mainImage ? (
              <Image src={app.mainImage} alt={app.title} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cream to-cream-dark">
                <span className="font-[family-name:var(--font-family-heading)] text-2xl text-warm-gray-light">{app.title}</span>
              </div>
            )}
          </div>

          <h1 className="font-[family-name:var(--font-family-heading)] text-2xl md:text-3xl font-semibold text-charcoal mb-4">{app.title}</h1>
          <div className="w-12 h-px bg-bronze mb-6" />

          {app.shortDescription && <p className="text-warm-gray leading-relaxed mb-6 text-lg">{app.shortDescription}</p>}
          {app.longDescription && <div className="text-warm-gray leading-relaxed whitespace-pre-line mb-8">{app.longDescription}</div>}

          {gallery.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {gallery.map((img) => (
                <div key={img.id} className="aspect-4/3 bg-cream rounded-lg overflow-hidden relative">
                  <Image src={img.imagePath} alt={img.altText || app.title} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">Bilgi Al</a>
            <Link href="/teklif-al" className="btn-primary">Teklif Al</Link>
          </div>
        </div>
      </section>
    </>
  );
}
