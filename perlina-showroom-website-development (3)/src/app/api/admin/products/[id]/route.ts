import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser, hasPermission, logAudit } from "@/lib/auth";

type Props = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Props) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const ok = await hasPermission(user.id, "products.edit");
  if (!ok) return NextResponse.json({ error: "Yetkiniz yok" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  const [updated] = await db.update(products).set({
    name: body.name, slug: body.slug,
    shortDescription: body.shortDescription, longDescription: body.longDescription,
    collectionId: body.collectionId || null, subcollectionId: body.subcollectionId || null,
    mainImage: body.mainImage, status: body.status,
    featured: body.featured, sortOrder: body.sortOrder,
    seoTitle: body.seoTitle, metaDescription: body.metaDescription,
    updatedAt: new Date(),
  }).where(eq(products.id, parseInt(id))).returning();

  if (!updated) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  await logAudit(user.id, "products.edit", `Ürünü güncelledi: ${body.name}`, "product", parseInt(id));
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Props) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const ok = await hasPermission(user.id, "products.delete");
  if (!ok) return NextResponse.json({ error: "Yetkiniz yok" }, { status: 403 });

  const { id } = await params;
  const [deleted] = await db.delete(products).where(eq(products.id, parseInt(id))).returning();
  if (!deleted) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  await logAudit(user.id, "products.delete", `Ürünü sildi: ${deleted.name}`, "product", parseInt(id));
  return NextResponse.json({ success: true });
}
