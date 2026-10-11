import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, collections, subcollections, applications, media, contactRequests, users, auditLogs } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });

  const [prodCount] = await db.select({ count: sql<number>`count(*)` }).from(products);
  const [activeProdCount] = await db.select({ count: sql<number>`count(*)` }).from(products).where(eq(products.status, "active"));
  const [colCount] = await db.select({ count: sql<number>`count(*)` }).from(collections);
  const [subCount] = await db.select({ count: sql<number>`count(*)` }).from(subcollections);
  const [appCount] = await db.select({ count: sql<number>`count(*)` }).from(applications);
  const [mediaCount] = await db.select({ count: sql<number>`count(*)` }).from(media);
  const [contactCount] = await db.select({ count: sql<number>`count(*)` }).from(contactRequests);
  const [newContactCount] = await db.select({ count: sql<number>`count(*)` }).from(contactRequests).where(eq(contactRequests.status, "new"));
  const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);

  const recentLogs = await db.select({
    id: auditLogs.id,
    action: auditLogs.action,
    description: auditLogs.description,
    createdAt: auditLogs.createdAt,
    username: users.username,
  }).from(auditLogs)
    .leftJoin(users, eq(auditLogs.userId, users.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(10);

  return NextResponse.json({
    products: Number(prodCount.count),
    activeProducts: Number(activeProdCount.count),
    collections: Number(colCount.count),
    subcollections: Number(subCount.count),
    applications: Number(appCount.count),
    media: Number(mediaCount.count),
    contacts: Number(contactCount.count),
    newContacts: Number(newContactCount.count),
    users: Number(userCount.count),
    recentLogs,
  });
}
