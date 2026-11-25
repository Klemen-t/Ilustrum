import { NextRequest, NextResponse } from "next/server";
import { findOrCreateUser, createSessionToken, setSessionCookie, isAllowedDomain } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const origin = (process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin).replace(/\/$/, "");

  if (error || !code) {
    return NextResponse.redirect(new URL(`/login?error=oauth_cancelled`, origin));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${origin}/api/auth/callback/google`;

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
      const desc = encodeURIComponent(tokenData.error_description || tokenData.error || "token_exchange_failed");
      return NextResponse.redirect(new URL(`/login?error=token_exchange_failed&details=${desc}`, origin));
    }

    // 2. Obtenir les dades del perfil de l'usuari des de Google
    const userinfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profile = await userinfoResponse.json();

    if (!profile.email) {
      return NextResponse.redirect(new URL("/login?error=email_not_provided", origin));
    }

    const email = profile.email.toLowerCase().trim();

    // 3. SEGURETAT SERVER-SIDE: Validar estrictament el domini @lacetania.cat o llista blanca
    if (!isAllowedDomain(email)) {
      console.warn(`[SEGURETAT] Intent d'accés no autoritzat amb compte extern: ${email}`);
      return NextResponse.redirect(
        new URL(`/login?error=domain_not_allowed&email=${encodeURIComponent(email)}`, origin)
      );
    }

    // 4. Crear o actualitzar l'usuari a la base de dades PostgreSQL
    const user = await findOrCreateUser({
      email,
      name: profile.name || profile.given_name || email.split("@")[0],
      avatar: profile.picture || null,
      googleId: profile.sub || null,
    });

    // 5. Crear el token JWT de sessió
    const sessionToken = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.displayName || user.name,
      role: user.role.name,
    });

    // 6. Redirigir al Dashboard adjuntant explícitament la cookie de sessió segura
    const redirectResponse = NextResponse.redirect(new URL("/dashboard", origin));
    redirectResponse.cookies.set("ilustrum_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 dies
    });

    return redirectResponse;
  } catch (err: unknown) {
    console.error("Error en el procés de callback OAuth:", err);
    const errMessage = encodeURIComponent(err instanceof Error ? err.message : "internal_auth_error");
    return NextResponse.redirect(new URL(`/login?error=internal_auth_error&details=${errMessage}`, origin));
  }
}
