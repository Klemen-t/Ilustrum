import { NextRequest, NextResponse } from "next/server";
import { findOrCreateUser, createSessionToken, setSessionCookie, isAllowedDomain } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://10.51.100.102";

  if (error || !code) {
    return NextResponse.redirect(new URL(`/login?error=oauth_cancelled`, appUrl));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${appUrl}/api/auth/callback/google`;

  try {
    // 1. Canviar el codi temporal pel token d'accés de Google
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId || "",
        client_secret: clientSecret || "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("Error obtenint token de Google:", tokenData);
      return NextResponse.redirect(new URL("/login?error=token_exchange_failed", appUrl));
    }

    // 2. Obtenir les dades del perfil de l'usuari des de Google
    const userinfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profile = await userinfoResponse.json();

    if (!profile.email) {
      return NextResponse.redirect(new URL("/login?error=email_not_provided", appUrl));
    }

    const email = profile.email.toLowerCase().trim();

    // 3. SEGURETAT SERVER-SIDE: Validar estrictament el domini @lacetania.cat
    if (!isAllowedDomain(email)) {
      console.warn(`[SEGURETAT] Intent d'accés no autoritzat amb compte extern: ${email}`);
      return NextResponse.redirect(
        new URL(`/login?error=domain_not_allowed&email=${encodeURIComponent(email)}`, appUrl)
      );
    }

    // 4. Crear o actualitzar l'usuari a la base de dades PostgreSQL
    const user = await findOrCreateUser({
      email,
      name: profile.name || profile.given_name || email.split("@")[0],
      avatar: profile.picture || null,
      googleId: profile.sub || null,
    });

    // 5. Crear el token JWT de sessió i establir la cookie segura
    const sessionToken = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.displayName || user.name,
      role: user.role.name,
    });

    await setSessionCookie(sessionToken);

    // 6. Redirigir al Dashboard de l'usuari
    return NextResponse.redirect(new URL("/dashboard", appUrl));
  } catch (err: unknown) {
    console.error("Error en el procés de callback OAuth:", err);
    return NextResponse.redirect(new URL("/login?error=internal_auth_error", appUrl));
  }
}
