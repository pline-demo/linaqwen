import { MetadataRoute } from "next";
import { db } from "@/db";
import { collections, subcollections, products, applications } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://perlina.com.tr";

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1 },
    { url: `${baseUrl}/koleksiyonlar`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${baseUrl}/urunler`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${baseUrl}/uygulamalarimiz`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${baseUrl}/magazamiz`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${baseUrl}/iletisim`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${baseUrl}/teklif-al`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
  ];

  const cols = await db.select().from(collections).where(eq(collections.status, "active"));
  const colPages = cols.map(c => ({
    url: `${baseUrl}/koleksiyon/${c.slug}`,
    lastModified: c.updatedAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const subs = await db.select({
    slug: subcollections.slug,
    colSlug: collections.slug,
    updatedAt: subcollections.updatedAt,
  }).from(subcollections)
    .innerJoin(collections, eq(subcollections.collectionId, collections.id))
    .where(eq(subcollections.status, "active"));

  const subPages = subs.map(s => ({
    url: `${baseUrl}/koleksiyon/${s.colSlug}/${s.slug}`,
    lastModified: s.updatedAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const prods = await db.select().from(products).where(eq(products.status, "active"));
  const prodPages = prods.map(p => ({
    url: `${baseUrl}/urun/${p.slug}`,
    lastModified: p.updatedAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const apps = await db.select().from(applications).where(eq(applications.status, "active"));
  const appPages = apps.map(a => ({
    url: `${baseUrl}/uygulama/${a.slug}`,
    lastModified: a.updatedAt || new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...colPages, ...subPages, ...prodPages, ...appPages];
}
