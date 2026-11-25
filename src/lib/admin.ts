import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const EXCLUSIVE_ADMIN_EMAIL = "ramon.clemente@lacetania.cat";

/**
 * Valida de manera estricta que la petició provingui de l'administrador autoritzat.
 * Només 'ramon.clemente@lacetania.cat' té accés a les funcions administratives.
 */
export async function requireAdmin() {
  const session = await getSession();

  if (!session) {
    throw new Error("No autenticat");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { role: true },
  });

  if (
    !user ||
    !user.isActive ||
    user.role.name !== "admin" ||
    user.email.toLowerCase().trim() !== EXCLUSIVE_ADMIN_EMAIL.toLowerCase().trim()
  ) {
    throw new Error("Accés restringit exclusivament a l'administrador autoritzat (ramon.clemente@lacetania.cat)");
  }

  return user;
}
