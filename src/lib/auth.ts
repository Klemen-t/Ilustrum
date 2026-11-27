import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "ilustrum-super-secret-key-at-least-32-chars-long"
);

const COOKIE_NAME = "ilustrum_session";
const ALLOWED_DOMAIN = (process.env.ALLOWED_EMAIL_DOMAIN || "lacetania.cat").toLowerCase();
const EXTRA_ALLOWED_EMAILS: string[] = [];

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Valida si un email pertany al domini permès (@lacetania.cat) o als usuaris explícitament autoritzats.
 * Aquesta comprovació es fa sempre al servidor.
 */
export function isAllowedDomain(email: string): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  if (EXTRA_ALLOWED_EMAILS.includes(normalized)) return true;
  return normalized.endsWith(`@${ALLOWED_DOMAIN}`);
}

/**
 * Genera un token JWT firmat per a la sessió de l'usuari.
 */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

/**
 * Verifica un token JWT i en retorna el contingut.
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}

/**
 * Estableix la cookie de sessió httpOnly i segura.
 */
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 dies
  });
}

/**
 * Elimina la cookie de sessió.
 */
export async function removeSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Obté la sessió de l'usuari actual a partir de les cookies de la petició.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Obté l'usuari complet de la base de dades amb les seves estadístiques i rol.
 */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      role: true,
      stats: true,
    },
  });

  if (!user || !user.isActive) {
    return null;
  }

  return user;
}

/**
 * Registra o actualitza un usuari que ha iniciat sessió (per exemple via Google).
 * Valida de manera imperativa el domini al servidor.
 */
export async function findOrCreateUser({
  email,
  name,
  avatar,
  googleId,
  roleName = "student",
}: {
  email: string;
  name: string;
  avatar?: string | null;
  googleId?: string | null;
  roleName?: string;
}) {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Validació de seguretat estricta al servidor
  if (!isAllowedDomain(normalizedEmail)) {
    throw new Error(`Accés denegat: Només s'autoritzen correus de @${ALLOWED_DOMAIN}`);
  }

  // 2. Cercar si l'usuari ja existeix
  let user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { role: true },
  });

  if (!user) {
    // Determinar el rol: només 'ramon.clemente@lacetania.cat' pot ser administrador
    const isExclusiveAdmin = normalizedEmail === "ramon.clemente@lacetania.cat";
    let effectiveRoleName = isExclusiveAdmin ? "admin" : (roleName === "admin" ? "student" : roleName);

    const role = await prisma.role.findUnique({
      where: { name: effectiveRoleName },
    });

    if (!role) {
      throw new Error(`Rol ${effectiveRoleName} no trobat a la base de dades`);
    }

    // Crear usuari a PostgreSQL
    user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name || normalizedEmail.split("@")[0],
        displayName: name || normalizedEmail.split("@")[0],
        avatar: avatar || null,
        googleId: googleId || null,
        roleId: role.id,
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        points: 50, // Punts de benvinguda
        totalPoints: 50,
        lastLoginAt: new Date(),
        stats: {
          create: {
            totalAnswers: 0,
            correctAnswers: 0,
            totalCards: 0,
            uniqueCards: 0,
            tradesCompleted: 0,
            streakDays: 1,
            lastActivityDate: new Date(),
          },
        },
      },
      include: { role: true },
    });

    // Atorgar la insígnia de benvinguda ("Pioner de Lacetània")
    const pioneerBadge = await prisma.badge.findFirst({
      where: { name: "Pioner de Lacetània" },
    });

    if (pioneerBadge) {
      await prisma.userBadge.create({
        data: {
          userId: user.id,
          badgeId: pioneerBadge.id,
        },
      });
    }

    // Registrar log d'activitat
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "USER_REGISTERED",
        entity: "user",
        entityId: user.id,
        metadata: JSON.stringify({ email: user.email, role: user.role.name }),
      },
    });
  } else {
    // Actualitzar última data d'inici de sessió i avatar si cal
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        avatar: avatar || user.avatar,
        name: name || user.name,
        googleId: googleId || user.googleId,
      },
      include: { role: true },
    });

    // Registrar log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "USER_LOGIN",
        entity: "user",
        entityId: user.id,
      },
    });
  }

  return user;
}
