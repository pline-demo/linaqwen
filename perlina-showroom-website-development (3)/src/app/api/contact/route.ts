import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contactRequests } from "@/db/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, subject, message, relatedProduct, relatedCollection } = body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ success: false, error: "Ad soyad zorunludur." }, { status: 400 });
    }
    if (!phone || typeof phone !== "string" || phone.trim().length < 7) {
      return NextResponse.json({ success: false, error: "Geçerli bir telefon numarası giriniz." }, { status: 400 });
    }
    if (!message || typeof message !== "string" || message.trim().length < 5) {
      return NextResponse.json({ success: false, error: "Mesaj en az 5 karakter olmalıdır." }, { status: 400 });
    }

    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "";

    await db.insert(contactRequests).values({
      name: name.trim().substring(0, 200),
      phone: phone.trim().substring(0, 30),
      email: email ? String(email).trim().substring(0, 200) : null,
      subject: subject ? String(subject).trim().substring(0, 300) : null,
      message: message.trim().substring(0, 5000),
      relatedProduct: relatedProduct ? String(relatedProduct).substring(0, 300) : null,
      relatedCollection: relatedCollection ? String(relatedCollection).substring(0, 300) : null,
      ipAddress: String(ip).substring(0, 50),
      status: "new",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ success: false, error: "Bir hata oluştu." }, { status: 500 });
  }
}
