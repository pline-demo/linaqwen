import { NextResponse } from "next/server";
import { AUTH_COOKIE, getCurrentUser, logAudit } from "@/lib/auth";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (user) {
      await logAudit(user.id, "logout", "Yönetim panelinden çıkış yaptı.");
    }
    const response = NextResponse.json({ success: true });
    response.cookies.set(AUTH_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
    return response;
  } catch {
    const response = NextResponse.json({ success: true });
    response.cookies.set(AUTH_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
    return response;
  }
}
