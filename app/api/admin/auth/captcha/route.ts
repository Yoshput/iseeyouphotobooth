import { NextResponse } from "next/server";
import { generateCaptcha } from "@/lib/auth/captcha";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const challenge = generateCaptcha();
    return NextResponse.json({
      success: true,
      data: challenge,
    });
  } catch (err: any) {
    console.error("Error generating CAPTCHA:", err);
    return NextResponse.json(
      { success: false, error: "Gagal membuat kode verifikasi." },
      { status: 500 }
    );
  }
}
