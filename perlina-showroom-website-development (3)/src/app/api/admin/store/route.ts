import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { store } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser, hasPermission, logAudit } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const [storeData] = await db.select().from(store);
  return NextResponse.json(storeData || {});
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const ok = await hasPermission(user.id, "store.manage");
  if (!ok) return NextResponse.json({ error: "Yetkiniz yok" }, { status: 403 });

  const body = await req.json();
  
  const [existing] = await db.select().from(store);
  
  if (existing) {
    await db.update(store).set({
      name: body.name,
      address: body.address,
      phone: body.phone,
      whatsapp: body.whatsapp,
      email: body.email,
      workingHours: body.workingHours,
      mapLat: body.mapLat,
      mapLng: body.mapLng,
      mapZoom: body.mapZoom,
      mapEmbedUrl: body.mapEmbedUrl,
      description: body.description,
      heroImage: body.heroImage,
      exteriorImage: body.exteriorImage,
      interiorImage: body.interiorImage,
      updatedAt: new Date(),
    }).where(eq(store.id, existing.id));
  } else {
    await db.insert(store).values(body);
  }

  await logAudit(user.id, "store.update", "Mağaza bilgilerini güncelledi.");
  return NextResponse.json({ success: true });
}
