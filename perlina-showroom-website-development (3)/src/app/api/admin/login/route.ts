import { NextRequest, NextResponse } from "next/server";
import { login, AUTH_COOKIE } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ success: false, error: "Kullanıcı adı ve şifre gereklidir." }, { status: 400 });
    }

    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const ua = request.headers.get("user-agent") || "unknown";

    const result = await login(username.trim(), password, ip, ua);

    if (result.error) {
      return NextResponse.json({ success: false, error: result.error }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, user: { id: result.user!.id, username: result.user!.username, fullName: result.user!.fullName } });
    response.cookies.set(AUTH_COOKIE, result.token!, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24h
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ success: false, error: "Giriş işlemi sırasında bir hata oluştu." }, { status: 500 });
  }
}
