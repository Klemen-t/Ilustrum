import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "No autoritzat" }, { status: 401 });
  }

  // Obtenir insígnies de l'usuari
  const allBadges = await prisma.badge.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });

  const userBadges = await prisma.userBadge.findMany({
    where: { userId: user.id },
    include: { badge: true },
  });

  const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badgeId));

  const badgesWithStatus = allBadges.map((b) => ({
    id: b.id,
    name: b.name,
    description: b.description,
    imageUrl: b.imageUrl,
    earned: earnedBadgeIds.has(b.id),
    earnedAt: userBadges.find((ub) => ub.badgeId === b.id)?.earnedAt || null,
  }));

  // Estadístiques de col·lecció
  const totalCardsInDB = await prisma.card.count({ where: { isActive: true } });
  const uniqueCardsOwned = await prisma.userInventory.count({
    where: { userId: user.id, quantity: { gt: 0 } },
  });
  const totalCardsOwned = await prisma.userInventory.aggregate({
    where: { userId: user.id },
    _sum: { quantity: true },
  });

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      displayName: user.displayName || user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role.name,
      level: user.level,
      xp: user.xp,
      xpToNextLevel: user.xpToNextLevel,
      points: user.points,
      totalPoints: user.totalPoints,
      createdAt: user.createdAt,
    },
    stats: {
      questionsAnswered: user.stats?.totalAnswers ?? 0,
      correctAnswers: user.stats?.correctAnswers ?? 0,
      accuracy:
        user.stats && user.stats.totalAnswers > 0
          ? Math.round((user.stats.correctAnswers / user.stats.totalAnswers) * 100)
          : 0,
      currentStreak: user.stats?.streakDays ?? 0,
      tradesCompleted: user.stats?.tradesCompleted ?? 0,
      uniqueCards: uniqueCardsOwned,
      totalCards: totalCardsOwned._sum.quantity ?? 0,
      totalAlbumCards: totalCardsInDB,
      albumCompletionPercent:
        totalCardsInDB > 0 ? Math.round((uniqueCardsOwned / totalCardsInDB) * 100) : 0,
    },
    badges: badgesWithStatus,
  });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "No autoritzat" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { displayName, avatar } = body;

    const dataToUpdate: { displayName?: string; avatar?: string } = {};

    if (displayName && typeof displayName === "string") {
      const cleanName = displayName.trim();
      if (cleanName.length >= 2 && cleanName.length <= 40) {
        dataToUpdate.displayName = cleanName;
      }
    }

    if (avatar && typeof avatar === "string") {
      // Validar format de URL bàsic o cadena buida
      if (avatar.startsWith("http://") || avatar.startsWith("https://") || avatar === "") {
        dataToUpdate.avatar = avatar || null as any;
      }
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: dataToUpdate,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        name: updated.name,
        displayName: updated.displayName || updated.name,
        avatar: updated.avatar,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error al desar el perfil" }, { status: 500 });
  }
}
