import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, collections } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser, hasPermission, logAudit } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const prods = await db.select({
    id: products.id, name: products.name, slug: products.slug,
    shortDescription: products.shortDescription, mainImage: products.mainImage,
    status: products.status, featured: products.featured, sortOrder: products.sortOrder,
    collectionName: collections.name, createdAt: products.createdAt,
  }).from(products)
    .leftJoin(collections, eq(products.collectionId, collections.id))
    .orderBy(products.sortOrder, desc(products.createdAt));
  return NextResponse.json(prods);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const ok = await hasPermission(user.id, "products.create");
  if (!ok) return NextResponse.json({ error: "Yetkiniz yok" }, { status: 403 });

  const body = await req.json();
  if (!body.name?.trim()) return NextResponse.json({ error: "Ürün adı zorunludur." }, { status: 400 });

  const slug = body.slug?.trim() || slugify(body.name);

  const [created] = await db.insert(products).values({
    name: body.name.trim(), slug,
    shortDescription: body.shortDescription || null,
    longDescription: body.longDescription || null,
    collectionId: body.collectionId || null,
    subcollectionId: body.subcollectionId || null,
    mainImage: body.mainImage || null,
    status: body.status || "active",
    featured: body.featured || false,
    sortOrder: body.sortOrder || 0,
    seoTitle: body.seoTitle || null,
    metaDescription: body.metaDescription || null,
  }).returning();

  await logAudit(user.id, "products.create", `Yeni ürün oluşturdu: ${body.name}`, "product", created.id);
  return NextResponse.json(created, { status: 201 });
}
