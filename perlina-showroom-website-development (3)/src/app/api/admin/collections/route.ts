import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { collections } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser, hasPermission, logAudit } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const ok = await hasPermission(user.id, "collections.view");
  if (!ok) return NextResponse.json({ error: "Yetkiniz yok" }, { status: 403 });

  const cols = await db.select().from(collections).orderBy(collections.sortOrder, desc(collections.createdAt));
  return NextResponse.json(cols);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const ok = await hasPermission(user.id, "collections.create");
  if (!ok) return NextResponse.json({ error: "Yetkiniz yok" }, { status: 403 });

  const body = await req.json();
  if (!body.name || body.name.trim().length < 2) {
    return NextResponse.json({ error: "Koleksiyon adı zorunludur." }, { status: 400 });
  }

  const slug = body.slug ? body.slug.trim() : slugify(body.name);

  const [existing] = await db.select().from(collections).where(eq(collections.slug, slug));
  if (existing) return NextResponse.json({ error: "Bu slug zaten kullanılıyor." }, { status: 400 });

  const [created] = await db.insert(collections).values({
    name: body.name.trim(),
    slug,
    shortDescription: body.shortDescription || null,
    longDescription: body.longDescription || null,
    coverImage: body.coverImage || null,
    heroImage: body.heroImage || null,
    status: body.status || "active",
    sortOrder: body.sortOrder || 0,
    featured: body.featured || false,
    seoTitle: body.seoTitle || null,
    metaDescription: body.metaDescription || null,
  }).returning();

  await logAudit(user.id, "collections.create", `Koleksiyon oluşturdu: ${body.name}`, "collection", created.id);

  return NextResponse.json(created, { status: 201 });
}
