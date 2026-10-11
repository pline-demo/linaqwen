import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { homepageSections } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser, hasPermission, logAudit } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const sections = await db.select().from(homepageSections).orderBy(homepageSections.sortOrder);
  return NextResponse.json(sections);
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const ok = await hasPermission(user.id, "homepage.manage");
  if (!ok) return NextResponse.json({ error: "Yetkiniz yok" }, { status: 403 });

  const body = await req.json();
  const { sectionKey, ...data } = body;

  if (!sectionKey) return NextResponse.json({ error: "sectionKey gerekli" }, { status: 400 });

  const [existing] = await db.select().from(homepageSections).where(eq(homepageSections.sectionKey, sectionKey));

  if (existing) {
    await db.update(homepageSections).set({
      title: data.title,
      subtitle: data.subtitle,
      description: data.description,
      ctaText: data.ctaText,
      ctaUrl: data.ctaUrl,
      ctaText2: data.ctaText2,
      ctaUrl2: data.ctaUrl2,
      imageDesktop: data.imageDesktop,
      imageMobile: data.imageMobile,
      isActive: data.isActive,
      sortOrder: data.sortOrder,
      updatedAt: new Date(),
    }).where(eq(homepageSections.sectionKey, sectionKey));
  } else {
    await db.insert(homepageSections).values({ sectionKey, ...data });
  }

  await logAudit(user.id, "homepage.update", `Ana sayfa bölümü güncellendi: ${sectionKey}`);
  return NextResponse.json({ success: true });
}
