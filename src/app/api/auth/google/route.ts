import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "https://10.51.100.102"}/api/auth/callback/google`;
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
