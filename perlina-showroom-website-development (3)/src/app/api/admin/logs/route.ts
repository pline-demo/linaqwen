import { NextResponse } from "next/server";
import { db } from "@/db";
import { auditLogs, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser, hasPermission } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const ok = await hasPermission(user.id, "logs.view");
  if (!ok) return NextResponse.json({ error: "Yetkiniz yok" }, { status: 403 });

  const logs = await db.select({
    id: auditLogs.id,
    action: auditLogs.action,
    description: auditLogs.description,
    subjectType: auditLogs.subjectType,
    subjectId: auditLogs.subjectId,
    ipAddress: auditLogs.ipAddress,
    createdAt: auditLogs.createdAt,
    username: users.username,
    fullName: users.fullName,
  }).from(auditLogs)
    .leftJoin(users, eq(auditLogs.userId, users.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(200);

  return NextResponse.json(logs);
}
