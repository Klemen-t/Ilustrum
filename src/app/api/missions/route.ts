import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "No autoritzat" }, { status: 401 });
  }

  try {
    const [missions, userProgress, userBadges, allBadges, userStats] = await Promise.all([
      prisma.mission.findMany({ where: { isActive: true } }),
      prisma.missionProgress.findMany({ where: { userId: session.userId } }),
      prisma.userBadge.findMany({
        where: { userId: session.userId },
        include: { badge: true },
      }),
      prisma.badge.findMany({ where: { isActive: true } }),
      prisma.userStats.findUnique({ where: { userId: session.userId } }),
    ]);

    const progressMap = new Map(userProgress.map((p) => [p.missionId, p]));
    const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badgeId));

    // Mapejar missions calculant el progrés real
    const missionsWithProgress = missions.map((m) => {
      const p = progressMap.get(m.id);
      let currentProgress = p?.progress || 0;
      let target = 1;

      try {
        const cond = JSON.parse(m.condition);
        target = cond.count || cond.threshold || 1;

        if (cond.type === "correct_answers") {
          currentProgress = userStats?.correctAnswers || 0;
        } else if (cond.type === "answers_total") {
          currentProgress = userStats?.totalAnswers || 0;
        } else if (cond.type === "unique_cards") {
          currentProgress = userStats?.uniqueCards || 0;
        } else if (cond.type === "streak") {
          currentProgress = userStats?.streakDays || 1;
        }
      } catch {
        // Fallback
      }

      const isCompleted = p?.isCompleted || currentProgress >= target;
      const percent = Math.min(100, Math.round((currentProgress / target) * 100));

      return {
        id: m.id,
        name: m.name,
        description: m.description,
        type: m.type,
        rewardPoints: m.rewardPoints,
        rewardXp: m.rewardXp,
        currentProgress: Math.min(currentProgress, target),
        target,
        percent,
        isCompleted,
      };
    });

    const badgesWithStatus = allBadges.map((b) => ({
      id: b.id,
      name: b.name,
      description: b.description,
      imageUrl: b.imageUrl,
      isEarned: earnedBadgeIds.has(b.id),
      earnedAt: userBadges.find((ub) => ub.badgeId === b.id)?.earnedAt || null,
    }));

    return NextResponse.json({
      missions: missionsWithProgress,
      badges: badgesWithStatus,
    });
  } catch (error: unknown) {
    console.error("Error obtenint missions:", error);
    return NextResponse.json({ error: "Error obtenint les missions." }, { status: 500 });
  }
}
