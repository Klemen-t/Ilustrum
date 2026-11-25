import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "No autoritzat" }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        role: { name: { in: ["student", "teacher"] } },
      },
      select: {
        id: true,
        name: true,
        displayName: true,
        avatar: true,
        email: true,
        level: true,
        xp: true,
        stats: true,
        _count: {
          select: {
            inventory: {
              where: { isPasted: true },
            },
          },
        },
      },
      take: 100,
    });

    // Ordenar principalment per qui té més cromos enganxats a l'àlbum
    const sorted = users.sort((a, b) => {
      const cardsA = a._count.inventory || a.stats?.pastedCards || 0;
      const cardsB = b._count.inventory || b.stats?.pastedCards || 0;
      if (cardsB !== cardsA) return cardsB - cardsA;

      const correctA = a.stats?.correctAnswers || 0;
      const correctB = b.stats?.correctAnswers || 0;
      if (correctB !== correctA) return correctB - correctA;

      return b.level - a.level;
    });

    const ranking = sorted.map((u, index) => ({
      position: index + 1,
      id: u.id,
      name: u.displayName || u.name,
      avatar: u.avatar,
      email: u.email,
      level: u.level,
      uniqueCards: u._count.inventory || u.stats?.pastedCards || 0,
      correctAnswers: u.stats?.correctAnswers || 0,
      totalAnswers: u.stats?.totalAnswers || 0,
      isCurrentUser: u.id === session.userId,
    }));

    return NextResponse.json({ ranking });
  } catch (error: unknown) {
    console.error("Error obtenint el rànquing:", error);
    return NextResponse.json({ error: "Error obtenint el rànquing." }, { status: 500 });
  }
}
