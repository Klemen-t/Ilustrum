import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await requireAdmin();

    const users = await prisma.user.findMany({
      include: {
        role: true,
        stats: true,
        _count: {
          select: {
            inventory: true,
            questionAttempts: true,
            tradesProposed: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const roles = await prisma.role.findMany();

    return NextResponse.json({ users, roles });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Accés no autoritzat";
    return NextResponse.json({ error: msg }, { status: 403 });
  }
}
