import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser, hasPermission, logAudit } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const allSettings = await db.select().from(settings);
  return NextResponse.json(allSettings);
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const ok = await hasPermission(user.id, "settings.manage");
  if (!ok) return NextResponse.json({ error: "Yetkiniz yok" }, { status: 403 });

  const body = await req.json();
  const entries: Array<{ key: string; value: string; group?: string }> = body.settings;
  if (!Array.isArray(entries)) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

  for (const entry of entries) {
    const [existing] = await db.select().from(settings).where(eq(settings.key, entry.key));
    if (existing) {
      await db.update(settings).set({ value: entry.value, updatedAt: new Date() }).where(eq(settings.key, entry.key));
    } else {
      await db.insert(settings).values({ key: entry.key, value: entry.value, group: entry.group || "general" });
    }
  }

  await logAudit(user.id, "settings.update", "Ayarları güncelledi.");
  return NextResponse.json({ success: true });
}
