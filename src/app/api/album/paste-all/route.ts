import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "No autoritzat" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { albumId } = body;

    // Buscar tots els cromos de l'inventari que pertanyen a aquest usuari i no estan enganxats
    const whereClause: any = {
      userId: session.userId,
      isPasted: false,
      quantity: { gt: 0 },
    };

    if (albumId) {
      whereClause.card = {
        albumId,
      };
    }

    const unpastedItems = await prisma.userInventory.findMany({
      where: whereClause,
      include: {
        card: {
          select: {
            id: true,
            number: true,
            name: true,
            albumId: true,
          },
        },
      },
    });

    if (unpastedItems.length === 0) {
      return NextResponse.json({
        success: true,
        pastedCount: 0,
        message: "No tens cap cromo pendent d'enganxar.",
      });
    }

    const itemIds = unpastedItems.map((item) => item.id);
    const cardIds = unpastedItems.map((item) => item.card.id);

    // Executar en transacció ràpida
    await prisma.$transaction(async (tx) => {
      // 1. Marcar tots com a enganxats
      await tx.userInventory.updateMany({
        where: {
          id: { in: itemIds },
        },
        data: {
          isPasted: true,
          pastedAt: new Date(),
        },
      });

      // 2. Incrementar estadístiques
      await tx.userStats.upsert({
        where: { userId: session.userId },
        update: {
          pastedCards: { increment: itemIds.length },
        },
        create: {
          userId: session.userId,
          pastedCards: itemIds.length,
        },
      });
    });

    return NextResponse.json({
      success: true,
      pastedCount: itemIds.length,
      cardIds,
      message: `S'han enganxat ${itemIds.length} cromos correctament!`,
    });
  } catch (error: unknown) {
    console.error("Error enganxant tots els cromos:", error);
    const msg = error instanceof Error ? error.message : "Error enganxant tots els cromos";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
