import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser, hasPermission, logAudit } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const ok = await hasPermission(user.id, "system.maintenance");
  if (!ok) return NextResponse.json({ error: "Yetkiniz yok" }, { status: 403 });

  const body = await req.json();
  const enabled = body.enabled === true ? "true" : "false";

  await db.update(settings).set({ value: enabled, updatedAt: new Date() }).where(eq(settings.key, "maintenance_mode"));

  await logAudit(user.id, "maintenance.toggle", `Bakım modunu ${enabled === "true" ? "aktif" : "pasif"} yaptı.`);
  return NextResponse.json({ success: true, maintenance: enabled === "true" });
}
