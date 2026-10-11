import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contactRequests } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getCurrentUser, hasPermission } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const ok = await hasPermission(user.id, "contact_requests.view");
  if (!ok) return NextResponse.json({ error: "Yetkiniz yok" }, { status: 403 });

  const requests = await db.select().from(contactRequests).orderBy(desc(contactRequests.createdAt));
  return NextResponse.json(requests);
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const ok = await hasPermission(user.id, "contact_requests.manage");
  if (!ok) return NextResponse.json({ error: "Yetkiniz yok" }, { status: 403 });

  const body = await req.json();
  if (!body.id || !body.status) return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });

  await db.update(contactRequests).set({ status: body.status, updatedAt: new Date() }).where(eq(contactRequests.id, body.id));
  return NextResponse.json({ success: true });
}
