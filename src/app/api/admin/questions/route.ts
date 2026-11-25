import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await requireAdmin();

    const questions = await prisma.question.findMany({
      include: {
        category: true,
        subject: true,
        answers: {
          orderBy: { sortOrder: "asc" },
        },
        _count: {
          select: { attempts: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ questions });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Accés no autoritzat";
    return NextResponse.json({ error: msg }, { status: 403 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const { statement, difficulty, points, xpReward, recommendedTime, explanation, categoryId, subjectId, answers } = body;

    if (!statement || !answers || !Array.isArray(answers) || answers.length < 2) {
      return NextResponse.json(
        { error: "La pregunta ha de tenir un enunciat i com a mínim 2 respostes possibles." },
        { status: 400 }
      );
    }

    const hasCorrect = answers.some((a: any) => a.isCorrect);
    if (!hasCorrect) {
      return NextResponse.json(
        { error: "Com a mínim una resposta ha de ser marcada com a correcta." },
        { status: 400 }
      );
    }

    const question = await prisma.question.create({
      data: {
        statement,
        difficulty: difficulty || "medium",
        points: Number(points) || 10,
        xpReward: Number(xpReward) || 15,
        recommendedTime: Number(recommendedTime) || 60,
        explanation: explanation || null,
        categoryId: categoryId ? Number(categoryId) : null,
        subjectId: subjectId ? Number(subjectId) : null,
        answers: {
          create: answers.map((a: any, idx: number) => ({
            text: a.text,
            isCorrect: !!a.isCorrect,
            sortOrder: idx + 1,
          })),
        },
      },
      include: { answers: true },
    });

    // Registrar acció a l'auditoria
    await prisma.activityLog.create({
      data: {
        userId: admin.id,
        action: "ADMIN_CREATE_QUESTION",
        entity: "question",
        entityId: question.id,
        metadata: JSON.stringify({ statement: question.statement }),
      },
    });

    return NextResponse.json({ success: true, question });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error creant la pregunta";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
