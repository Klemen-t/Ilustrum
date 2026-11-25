import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "No autoritzat" }, { status: 401 });
  }

  try {
    const inventory = await prisma.userInventory.findMany({
      where: { userId: session.userId },
      include: {
        card: {
          include: {
            rarity: true,
            category: true,
            album: true,
          },
        },
      },
      orderBy: {
        card: { number: "asc" },
      },
    });

    const items = inventory.map((inv) => ({
      inventoryId: inv.id,
      quantity: inv.quantity,
      duplicates: Math.max(0, inv.quantity - 1),
      isDuplicate: inv.quantity > 1,
      source: inv.source,
      obtainedAt: inv.obtainedAt,
      card: {
        id: inv.card.id,
        name: inv.card.name,
        description: inv.card.description,
        number: inv.card.number,
        imageUrl: inv.card.imageUrl,
        value: inv.card.value,
        rarity: {
          id: inv.card.rarity.id,
          name: inv.card.rarity.name,
          colorHex: inv.card.rarity.colorHex,
          glowColor: inv.card.rarity.glowColor,
          sortOrder: inv.card.rarity.sortOrder,
        },
        category: inv.card.category
          ? {
              id: inv.card.category.id,
              name: inv.card.category.name,
              color: inv.card.category.color,
            }
          : null,
        album: {
          id: inv.card.album.id,
          name: inv.card.album.name,
        },
      },
    }));

    const totalCards = items.reduce((acc, item) => acc + item.quantity, 0);
    const uniqueCards = items.length;
    const totalDuplicates = items.reduce((acc, item) => acc + item.duplicates, 0);

    return NextResponse.json({
      inventory: items,
      stats: {
        totalCards,
        uniqueCards,
        totalDuplicates,
      },
    });
  } catch (error: unknown) {
    console.error("Error obtenint inventari:", error);
    return NextResponse.json({ error: "Error intern obtenint l'inventari." }, { status: 500 });
  }
}
