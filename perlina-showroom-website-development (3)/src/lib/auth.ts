import { db } from "@/db";
import { users, userRoles, rolePermissions, permissions, roles, auditLogs, loginLogs, failedLogins } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

// Simple token-based auth using cookies
const AUTH_COOKIE = "perlina_session";
const TOKEN_SECRET = process.env.AUTH_SECRET || "perlina-secret-key-change-in-production";

function generateToken(userId: number): string {
  const payload = `${userId}:${Date.now()}:${TOKEN_SECRET}`;
  return Buffer.from(payload).toString("base64");
}

function parseToken(token: string): number | null {
  try {
    const decoded = Buffer.from(token, "base64").toString();
    const parts = decoded.split(":");
    if (parts.length < 3) return null;
    const userId = parseInt(parts[0]);
    if (isNaN(userId)) return null;
    // Verify secret
    if (parts[2] !== TOKEN_SECRET) return null;
    // Check expiration (24h)
    const ts = parseInt(parts[1]);
    if (Date.now() - ts > 24 * 60 * 60 * 1000) return null;
    return userId;
  } catch {
    return null;
  }
}

export async function getSettings() {
  const { settings } = await import("@/db/schema");
  const rows = await db.select().from(settings);
  const map: Record<string, string> = {};
  for (const r of rows) {
    if (r.key && r.value !== null) map[r.key] = r.value;
  }
  return map;
}

export async function getAdminRoute(): Promise<string> {
  const s = await getSettings();
  return s["admin_route"] || "cmyonetim-x7p9";
}

export async function isMaintenanceMode(): Promise<boolean> {
  const s = await getSettings();
  return s["maintenance_mode"] === "true";
}

export async function login(username: string, password: string, ip: string, userAgent: string) {
  // Rate limiting check
  const recentFails = await db.select({ count: sql<number>`count(*)` })
    .from(failedLogins)
    .where(and(
      eq(failedLogins.ipAddress, ip),
      sql`${failedLogins.createdAt} > NOW() - INTERVAL '15 minutes'`
    ));

  if (recentFails[0] && Number(recentFails[0].count) > 10) {
    return { error: "Çok fazla başarısız giriş denemesi. Lütfen 15 dakika bekleyin." };
  }

  const [user] = await db.select().from(users).where(eq(users.username, username));
  if (!user) {
    await db.insert(failedLogins).values({ username, ipAddress: ip, userAgent });
    await db.insert(loginLogs).values({ username, action: "failed", ipAddress: ip, userAgent });
    return { error: "Kullanıcı adı veya şifre hatalı." };
  }

  if (user.status !== "active") {
    return { error: "Bu hesap devre dışı bırakılmış." };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    await db.insert(failedLogins).values({ username, ipAddress: ip, userAgent });
    await db.insert(loginLogs).values({ userId: user.id, username, action: "failed", ipAddress: ip, userAgent });
    return { error: "Kullanıcı adı veya şifre hatalı." };
  }

  // Success
  const token = generateToken(user.id);
  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
  await db.insert(loginLogs).values({ userId: user.id, username, action: "login", ipAddress: ip, userAgent });
  await db.insert(auditLogs).values({
    userId: user.id, action: "login", description: "Yönetim paneline giriş yaptı.",
    ipAddress: ip, userAgent
  });

  return { token, user };
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE)?.value;
    if (!token) return null;
    const userId = parseToken(token);
    if (!userId) return null;
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user || user.status !== "active") return null;
    return user;
  } catch {
    return null;
  }
}

export async function getUserPermissions(userId: number): Promise<string[]> {
  const result = await db
    .select({ slug: permissions.slug })
    .from(permissions)
    .innerJoin(rolePermissions, eq(rolePermissions.permissionId, permissions.id))
    .innerJoin(userRoles, eq(userRoles.roleId, rolePermissions.roleId))
    .where(eq(userRoles.userId, userId));
  return result.map(r => r.slug);
}

export async function hasPermission(userId: number, permSlug: string): Promise<boolean> {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (user?.isSuperAdmin) return true;
  const perms = await getUserPermissions(userId);
  return perms.includes(permSlug);
}

export async function logAudit(userId: number | null, action: string, description: string, subjectType?: string, subjectId?: number, ip?: string, ua?: string) {
  await db.insert(auditLogs).values({
    userId, action, description, subjectType, subjectId,
    ipAddress: ip || "", userAgent: ua || ""
  });
}

export { AUTH_COOKIE, generateToken };
