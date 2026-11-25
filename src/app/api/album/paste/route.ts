import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "No autoritzat" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { cardId } = body;

    if (!cardId) {
      return NextResponse.json({ error: "L'identificador del cromo és obligatori." }, { status: 400 });
    }

    // 1. Cercar si l'usuari posseeix aquest cromo
    const inventoryItem = await prisma.userInventory.findUnique({
      where: {
        userId_cardId: {
          userId: session.userId,
          cardId,
        },
      },
      include: {
        card: {
          include: {
            rarity: true,
            album: true,
          },
        },
      },
    });

    if (!inventoryItem || inventoryItem.quantity <= 0) {
      return NextResponse.json(
        { error: "No posseeixes aquest cromo a la mà per poder enganxar-lo." },
        { status: 404 }
      );
    }

    if (inventoryItem.isPasted) {
      return NextResponse.json({
        success: true,
        alreadyPasted: true,
        message: "Aquest cromo ja està enganxat a l'àlbum.",
        card: inventoryItem.card,
      });
    }

    // 2. Marcar com a enganxat
    const updated = await prisma.$transaction(async (tx) => {
      const inv = await tx.userInventory.update({
        where: { id: inventoryItem.id },
        data: {
          isPasted: true,
          pastedAt: new Date(),
        },
      });

      // Actualitzar estadístiques de l'usuari
      await tx.userStats.upsert({
        where: { userId: session.userId },
        update: {
          pastedCards: { increment: 1 },
        },
        create: {
          userId: session.userId,
          pastedCards: 1,
        },
      });

      return inv;
    });

    return NextResponse.json({
      success: true,
      isPasted: true,
      cardId,
      cardName: inventoryItem.card.name,
      cardNumber: inventoryItem.card.number,
      message: `Has enganxat el cromo #${inventoryItem.card.number} ${inventoryItem.card.name} al teu àlbum!`,
    });
  } catch (error: unknown) {
    console.error("Error enganxant cromo:", error);
    const msg = error instanceof Error ? error.message : "Error enganxant el cromo";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
