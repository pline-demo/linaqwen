import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subcollections, collections } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser, hasPermission, logAudit } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const subs = await db.select({
    id: subcollections.id,
    name: subcollections.name,
    slug: subcollections.slug,
    description: subcollections.description,
    status: subcollections.status,
    sortOrder: subcollections.sortOrder,
    featured: subcollections.featured,
    collectionId: subcollections.collectionId,
    collectionName: collections.name,
    createdAt: subcollections.createdAt,
  }).from(subcollections)
    .leftJoin(collections, eq(subcollections.collectionId, collections.id))
    .orderBy(subcollections.sortOrder, desc(subcollections.createdAt));
  
  return NextResponse.json(subs);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const ok = await hasPermission(user.id, "subcollections.create");
  if (!ok) return NextResponse.json({ error: "Yetkiniz yok" }, { status: 403 });

  const body = await req.json();
  if (!body.name?.trim()) return NextResponse.json({ error: "Ad zorunludur." }, { status: 400 });
  if (!body.collectionId) return NextResponse.json({ error: "Koleksiyon seçiniz." }, { status: 400 });

  const slug = body.slug?.trim() || slugify(body.name);

  const [created] = await db.insert(subcollections).values({
    name: body.name.trim(),
    slug,
    description: body.description || null,
    collectionId: parseInt(body.collectionId),
    status: body.status || "active",
    sortOrder: body.sortOrder || 0,
    featured: body.featured || false,
    seoTitle: body.seoTitle || null,
    metaDescription: body.metaDescription || null,
  }).returning();

  await logAudit(user.id, "subcollections.create", `Alt koleksiyon oluşturdu: ${body.name}`, "subcollection", created.id);
  return NextResponse.json(created, { status: 201 });
}
