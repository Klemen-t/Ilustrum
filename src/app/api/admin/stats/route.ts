import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await requireAdmin();

    const [
      totalUsers,
      totalStudents,
      totalTeachers,
      totalQuestions,
      totalAttempts,
      correctAttempts,
      totalCardsCirculation,
      totalTradesCompleted,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: { name: "student" } } }),
      prisma.user.count({ where: { role: { name: "teacher" } } }),
      prisma.question.count(),
      prisma.questionAttempt.count(),
      prisma.questionAttempt.count({ where: { isCorrect: true } }),
      prisma.userInventory.aggregate({ _sum: { quantity: true } }),
      prisma.trade.count({ where: { status: "ACCEPTED" } }),
    ]);

    const successRate = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

    return NextResponse.json({
      stats: {
        totalUsers,
        totalStudents,
        totalTeachers,
        totalQuestions,
        totalAttempts,
        correctAttempts,
        successRate,
        totalCardsInCirculation: totalCardsCirculation._sum.quantity || 0,
        totalTradesCompleted,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Accés no autoritzat";
    return NextResponse.json({ error: msg }, { status: 403 });
  }
}
