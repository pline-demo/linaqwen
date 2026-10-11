import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subcollections } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser, hasPermission, logAudit } from "@/lib/auth";

type Props = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Props) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const ok = await hasPermission(user.id, "subcollections.edit");
  if (!ok) return NextResponse.json({ error: "Yetkiniz yok" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  const [updated] = await db.update(subcollections).set({
    name: body.name,
    slug: body.slug,
    description: body.description,
    collectionId: body.collectionId ? parseInt(body.collectionId) : undefined,
    status: body.status,
    sortOrder: body.sortOrder,
    featured: body.featured,
    seoTitle: body.seoTitle,
    metaDescription: body.metaDescription,
    updatedAt: new Date(),
  }).where(eq(subcollections.id, parseInt(id))).returning();

  if (!updated) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  await logAudit(user.id, "subcollections.edit", `Alt koleksiyonu güncelledi: ${body.name}`, "subcollection", parseInt(id));
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Props) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const ok = await hasPermission(user.id, "subcollections.delete");
  if (!ok) return NextResponse.json({ error: "Yetkiniz yok" }, { status: 403 });

  const { id } = await params;
  const [deleted] = await db.delete(subcollections).where(eq(subcollections.id, parseInt(id))).returning();
  if (!deleted) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  await logAudit(user.id, "subcollections.delete", `Alt koleksiyonu sildi: ${deleted.name}`, "subcollection", parseInt(id));
  return NextResponse.json({ success: true });
}
