import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getMarketListings, createMarketListing } from "@/services/trade.service";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "No autoritzat" }, { status: 401 });
  }

  try {
    // 1. Llistat d'anuncis públics del mercat
    const listings = await getMarketListings(session.userId);

    // 2. Els meus cromos REPETITS (quantity > 1) disponibles per oferir
    const myInventory = await prisma.userInventory.findMany({
      where: {
        userId: session.userId,
        quantity: { gt: 1 }, // REGLA: Només repetits!
      },
      include: {
        card: {
          include: {
            rarity: true,
            category: true,
          },
        },
      },
      orderBy: { card: { number: "asc" } },
    });

    const myDuplicates = myInventory.map((inv) => ({
      id: inv.card.id,
      name: inv.card.name,
      number: inv.card.number,
      imageUrl: inv.card.imageUrl,
      availableCount: inv.quantity - 1,
      rarity: {
        name: inv.card.rarity.name,
        colorHex: inv.card.rarity.colorHex,
      },
      category: inv.card.category ? inv.card.category.name : null,
    }));

    // 3. Tots els cromos del catàleg que em falten (per triar què demano a canvi)
    const myOwnedCardIds = (
      await prisma.userInventory.findMany({
        where: { userId: session.userId },
        select: { cardId: true },
      })
    ).map((inv) => inv.cardId);

    const missingCards = await prisma.card.findMany({
      where: {
        isActive: true,
        id: { notIn: myOwnedCardIds },
      },
      select: {
        id: true,
        name: true,
        number: true,
        rarity: { select: { name: true, colorHex: true } },
      },
      orderBy: { number: "asc" },
      take: 60,
    });

    return NextResponse.json({
      listings,
      myDuplicates,
      missingCards,
    });
  } catch (error: unknown) {
    console.error("Error obtenint mercat d'intercanvis:", error);
    return NextResponse.json({ error: "Error obtenint el mercat." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "No autoritzat" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { offeredCardIds, requestedCardIds, message } = body;

    if (!offeredCardIds || !requestedCardIds) {
      return NextResponse.json(
        { error: "Has de seleccionar els cromos que ofereixes i els que demanes a canvi." },
        { status: 400 }
      );
    }

    const listing = await createMarketListing({
      proposerId: session.userId,
      offeredCardIds,
      requestedCardIds,
      message,
    });

    return NextResponse.json({ success: true, listing });
  } catch (error: unknown) {
    console.error("Error publicant al mercat:", error);
    const msg = error instanceof Error ? error.message : "Error creant l'anunci al mercat";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
