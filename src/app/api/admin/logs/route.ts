import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await requireAdmin();

    const logs = await prisma.activityLog.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json({ logs });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Accés no autoritzat";
    return NextResponse.json({ error: msg }, { status: 403 });
  }
}
