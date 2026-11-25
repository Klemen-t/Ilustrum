import { NextResponse } from "next/server";
import { removeSessionCookie } from "@/lib/auth";

export async function POST() {
  await removeSessionCookie();
  return NextResponse.json({ success: true, message: "Sessió tancada correctament" });
}

export async function GET() {
  await removeSessionCookie();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://10.51.100.102";
  return NextResponse.redirect(new URL("/login", appUrl));
}
