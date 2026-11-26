import { NextRequest, NextResponse } from "next/server";

function getAppBaseUrl(request: NextRequest): string {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  const proto = request.headers.get("x-forwarded-proto") || "https";

  // Si som a Vercel amb el nostre projecte Ilustrum, sempre usar el domini públic de producció
  // per evitar el "Deployment Protection / SSO" de les branques i previews de Vercel.
  if (host.includes("vercel.app") && host.includes("ilustrum")) {
    return "https://ilustrum.vercel.app";
  }
  if (host) {
    return `${proto}://${host}`.replace(/\/$/, "");
  }
  if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("infla.cat")) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  return request.nextUrl.origin.replace(/\/$/, "");
}

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const origin = getAppBaseUrl(request);
  const redirectUri = `${origin}/api/auth/callback/google`;
  const domain = process.env.ALLOWED_EMAIL_DOMAIN || "lacetania.cat";

  if (!clientId || clientId.includes("canvia_per")) {
    return NextResponse.json(
      {
        error: "Google OAuth no està configurat encara al fitxer .env.",
        message: "Configura GOOGLE_CLIENT_ID i GOOGLE_CLIENT_SECRET per habilitar l'inici amb Google.",
      },
      { status: 503 }
    );
  }

  // Paràmetres d'autorització OAuth2 de Google
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
  });

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  return NextResponse.redirect(googleAuthUrl);
}
