import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "ilustrum-super-secret-key-at-least-32-chars-long"
);

const COOKIE_NAME = "ilustrum_session";

// Rutes que requereixen autenticació
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/questions",
  "/album",
  "/inventory",
  "/trades",
  "/profile",
  "/ranking",
  "/missions",
  "/admin",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Permetre sempre rutes estàtiques, api d'auth, i recursos públics
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  let sessionPayload: { userId: string; email: string; name: string; role: string } | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      sessionPayload = {
        userId: payload.userId as string,
        email: payload.email as string,
        name: payload.name as string,
        role: payload.role as string,
      };
    } catch {
      // Token invàlid o expirat
      sessionPayload = null;
    }
  }

  // 2. Si l'usuari ja està autenticat i intenta anar a /login o a l'arrel /, redirigir al Dashboard
  if (pathname === "/login" || pathname === "/") {
    if (sessionPayload) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    // Si no està autenticat i va a /, redirigir a /login
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // 3. Comprovar si la ruta actual requereix autenticació
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isProtected) {
    // Si no hi ha sessió, redirigir al login amb callbackUrl
    if (!sessionPayload) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 4. Control de permisos específic per a rutes d'administració
    if (pathname.startsWith("/admin") && sessionPayload.role !== "admin") {
      const dashboardUrl = new URL("/dashboard", request.url);
      dashboardUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
