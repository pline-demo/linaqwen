import { NextResponse } from "next/server";
import { db } from "@/db";
import { applications } from "@/db/schema";
import { getCurrentUser, hasPermission } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const ok = await hasPermission(user.id, "applications.view");
  if (!ok) return NextResponse.json({ error: "Yetkiniz yok" }, { status: 403 });

  const apps = await db.select().from(applications).orderBy(applications.sortOrder);
  return NextResponse.json(apps);
}
