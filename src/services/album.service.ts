import { prisma } from "@/lib/db";

/**
 * Obtenir els IDs dels àlbums en què l'usuari està inscrit activament.
 * Si l'usuari no té cap registre previ d'inscripció (primer cop que entra),
 * l'inscriu per defecte als àlbums bàsics de SMIX perquè pugui començar.
 */
export async function getUserEnrolledAlbumIds(userId: string): Promise<string[]> {
  const enrollments = await prisma.userAlbumEnrollment.findMany({
    where: { userId },
  });

  if (enrollments.length === 0) {
    const allAlbums = await prisma.album.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    const smixAlbums = allAlbums.filter((a) => a.id.includes("smix"));
    const defaultEnroll = smixAlbums.length > 0 ? smixAlbums : allAlbums;

    await prisma.userAlbumEnrollment.createMany({
      data: defaultEnroll.map((a) => ({
        userId,
        albumId: a.id,
        isActive: true,
      })),
      skipDuplicates: true,
    });

    return defaultEnroll.map((a) => a.id);
  }

  return enrollments.filter((e) => e.isActive).map((e) => e.albumId);
}

/**
 * Commutar la participació d'un alumne en un àlbum concret (activar / desactivar)
 */
export async function toggleAlbumEnrollment(
  userId: string,
  albumId: string,
  forceState?: boolean
): Promise<{ albumId: string; isEnrolled: boolean }> {
  // Comprovar si l'usuari té registres previs; si no en té cap, inicialitzar primer
  const totalEnrollments = await prisma.userAlbumEnrollment.count({
    where: { userId },
  });
  if (totalEnrollments === 0) {
    await getUserEnrolledAlbumIds(userId);
  }

  const current = await prisma.userAlbumEnrollment.findUnique({
    where: { userId_albumId: { userId, albumId } },
  });

  const nextState = typeof forceState === "boolean" ? forceState : !current?.isActive;

  const result = await prisma.userAlbumEnrollment.upsert({
    where: { userId_albumId: { userId, albumId } },
    update: { isActive: nextState },
    create: { userId, albumId, isActive: nextState },
  });

  return { albumId, isEnrolled: result.isActive };
}
