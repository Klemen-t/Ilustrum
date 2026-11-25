import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "No autoritzat" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const requestedAlbumId = searchParams.get("albumId");

  try {
    // 1. Obtenir tots els àlbums actius
    const allAlbums = await prisma.album.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        cards: {
          where: { isActive: true },
          select: { id: true },
        },
      },
    });

    if (allAlbums.length === 0) {
      return NextResponse.json({ error: "No hi ha cap àlbum actiu." }, { status: 404 });
    }

    // 2. Inventari de l'usuari
    const userInventory = await prisma.userInventory.findMany({
      where: { userId: session.userId },
    });
    const inventoryMap = new Map(userInventory.map((item) => [item.cardId, item]));

    // 3. Crear llista d'àlbums amb estadístiques per al selector
    const albumsList = allAlbums.map((a) => {
      const totalCards = a.cards.length;
      const owned = a.cards.filter((c) => inventoryMap.has(c.id)).length;
      return {
        id: a.id,
        name: a.name,
        description: a.description,
        totalCards,
        ownedCount: owned,
        completionPercentage: totalCards > 0 ? Math.round((owned / totalCards) * 100) : 0,
      };
    });

    // 4. Seleccionar l'àlbum demanat o el primer disponible
    const targetAlbumId =
      requestedAlbumId && allAlbums.some((a) => a.id === requestedAlbumId)
        ? requestedAlbumId
        : allAlbums[0].id;

    const album = await prisma.album.findUnique({
      where: { id: targetAlbumId },
      include: {
        pages: {
          orderBy: { pageNum: "asc" },
        },
        cards: {
          where: { isActive: true },
          orderBy: { number: "asc" },
          include: {
            rarity: true,
            category: true,
          },
        },
      },
    });

    if (!album) {
      return NextResponse.json({ error: "Àlbum no trobat." }, { status: 404 });
    }

    // 5. Mapejar tots els cromos de l'àlbum
    const albumCards = album.cards.map((card) => {
      const inv = inventoryMap.get(card.id);
      const isOwned = !!inv && inv.quantity > 0;
      const isPasted = !!inv && inv.isPasted;
      const quantity = inv ? inv.quantity : 0;
      // Només es consideren repetits els que superin 1 exemplar (o 1 si ja està enganxat)
      const duplicates = Math.max(0, quantity - (isPasted ? 1 : 1));

      return {
        id: card.id,
        name: card.name,
        description: card.description,
        number: card.number,
        imageUrl: card.imageUrl,
        pageId: card.pageId,
        rarity: {
          id: card.rarity.id,
          name: card.rarity.name,
          nameKey: card.rarity.nameKey,
          colorHex: card.rarity.colorHex,
          glowColor: card.rarity.glowColor,
          sortOrder: card.rarity.sortOrder,
        },
        category: card.category
          ? {
              id: card.category.id,
              name: card.category.name,
              color: card.category.color,
            }
          : null,
        isOwned,
        isPasted,
        canPaste: isOwned && !isPasted,
        quantity,
        duplicates,
        obtainedAt: inv?.obtainedAt || null,
        pastedAt: inv?.pastedAt || null,
      };
    });

    // Cromos que l'usuari té en possessió d'aquest àlbum pendents d'enganxar a la mà
    const unpastedCards = albumCards.filter((c) => c.isOwned && !c.isPasted);

    const totalCards = albumCards.length;
    const pastedCount = albumCards.filter((c) => c.isPasted).length;
    const ownedCount = albumCards.filter((c) => c.isOwned).length;
    const totalDuplicates = albumCards.reduce((acc, c) => acc + c.duplicates, 0);
    // El progrés real de l'àlbum depèn dels cromos ENGANXATS
    const completionPercentage = totalCards > 0 ? Math.round((pastedCount / totalCards) * 100) : 0;

    return NextResponse.json({
      albums: albumsList,
      album: {
        id: album.id,
        name: album.name,
        description: album.description,
        totalCards,
        ownedCount,
        pastedCount,
        totalDuplicates,
        completionPercentage,
        pages: album.pages,
        cards: albumCards,
        unpastedCards,
      },
    });
  } catch (error: unknown) {
    console.error("Error obtenint àlbum:", error);
    return NextResponse.json({ error: "Error intern obtenint l'àlbum." }, { status: 500 });
  }
}
