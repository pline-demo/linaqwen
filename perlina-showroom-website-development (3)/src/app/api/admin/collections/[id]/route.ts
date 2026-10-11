import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { collections } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser, hasPermission, logAudit } from "@/lib/auth";

type Props = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Props) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const ok = await hasPermission(user.id, "collections.edit");
  if (!ok) return NextResponse.json({ error: "Yetkiniz yok" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  const [updated] = await db.update(collections).set({
    name: body.name, slug: body.slug,
    shortDescription: body.shortDescription, longDescription: body.longDescription,
    coverImage: body.coverImage, heroImage: body.heroImage,
    status: body.status, sortOrder: body.sortOrder, featured: body.featured,
    seoTitle: body.seoTitle, metaDescription: body.metaDescription,
    updatedAt: new Date(),
  }).where(eq(collections.id, parseInt(id))).returning();

  if (!updated) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  await logAudit(user.id, "collections.edit", `Koleksiyonu güncelledi: ${body.name}`, "collection", parseInt(id));
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Props) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const ok = await hasPermission(user.id, "collections.delete");
  if (!ok) return NextResponse.json({ error: "Yetkiniz yok" }, { status: 403 });

  const { id } = await params;
  const [deleted] = await db.delete(collections).where(eq(collections.id, parseInt(id))).returning();
  if (!deleted) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  await logAudit(user.id, "collections.delete", `Koleksiyonu sildi: ${deleted.name}`, "collection", parseInt(id));
  return NextResponse.json({ success: true });
}
