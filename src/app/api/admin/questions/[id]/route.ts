import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.question.update({
      where: { id },
      data: {
        statement: body.statement,
        difficulty: body.difficulty,
        points: body.points !== undefined ? Number(body.points) : undefined,
        xpReward: body.xpReward !== undefined ? Number(body.xpReward) : undefined,
        explanation: body.explanation,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: admin.id,
        action: "ADMIN_UPDATE_QUESTION",
        entity: "question",
        entityId: id,
        metadata: JSON.stringify(body),
      },
    });

    return NextResponse.json({ success: true, question: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error actualitzant la pregunta";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    // Desactivar pregunta per no trencar l'historial d'intents
    const question = await prisma.question.update({
      where: { id },
      data: { isActive: false },
    });

    await prisma.activityLog.create({
      data: {
        userId: admin.id,
        action: "ADMIN_DEACTIVATE_QUESTION",
        entity: "question",
        entityId: id,
      },
    });

    return NextResponse.json({ success: true, message: "Pregunta desactivada", question });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error desactivant la pregunta";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
