import { prisma } from "@/lib/db";
import { TradeStatus } from "@prisma/client";

export interface CreateMarketListingInput {
  proposerId: string;
  offeredCardIds: string[];
  requestedCardIds: string[];
  message?: string;
}

export interface AcceptMarketListingInput {
  tradeId: string;
  acceptingUserId: string;
  offeredCardIdsToGive: string[];
}

/**
 * Obté les ofertes actives del mercat d'intercanvis comunitari.
 */
export async function getMarketListings(currentUserId: string) {
  // 1. Obtenir l'inventari i repetits de l'usuari actual per saber què pot bescanviar
  const myInventory = await prisma.userInventory.findMany({
    where: { userId: currentUserId },
    include: { card: true },
  });
  const myDuplicateMap = new Map(
    myInventory.filter((inv) => inv.quantity > 1).map((inv) => [inv.cardId, inv.quantity - 1])
  );

  // 2. Obtenir anuncis actius del mercat
  const listings = await prisma.trade.findMany({
    where: {
      isMarketListing: true,
      status: TradeStatus.PENDING,
    },
    include: {
      proposer: {
        select: {
          id: true,
          name: true,
          displayName: true,
          avatar: true,
          email: true,
          level: true,
        },
      },
      offerItems: {
        include: {
          card: {
            include: {
              rarity: true,
              category: true,
            },
          },
        },
      },
      requestItems: {
        include: {
          card: {
            include: {
              rarity: true,
              category: true,
            },
          },
        },
      },
      counterOffers: {
        where: { status: TradeStatus.PENDING },
        include: {
          proposer: {
            select: {
              id: true,
              name: true,
              displayName: true,
              avatar: true,
            },
          },
          offerItems: {
            include: {
              card: {
                include: {
                  rarity: true,
                  category: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return listings.map((l) => {
    const isMyListing = l.proposerId === currentUserId;

    // Comprovar quins dels cromos sol·licitats té l'usuari actual REPETITS
    const matchingRequestedCards = l.requestItems
      .filter((req) => myDuplicateMap.has(req.cardId))
      .map((req) => ({
        id: req.card.id,
        name: req.card.name,
        number: req.card.number,
        rarity: req.card.rarity.name,
        colorHex: req.card.rarity.colorHex,
      }));

    const canAcceptDirectly = !isMyListing && matchingRequestedCards.length > 0;

    return {
      id: l.id,
      createdAt: l.createdAt,
      message: l.message,
      isMyListing,
      canAcceptDirectly,
      matchingRequestedCards,
      proposer: {
        id: l.proposer.id,
        name: l.proposer.displayName || l.proposer.name,
        avatar: l.proposer.avatar,
        email: l.proposer.email,
        level: l.proposer.level,
      },
      offeredCards: l.offerItems.map((item) => ({
        id: item.card.id,
        name: item.card.name,
        number: item.card.number,
        imageUrl: item.card.imageUrl,
        rarity: {
          name: item.card.rarity.name,
          colorHex: item.card.rarity.colorHex,
        },
        category: item.card.category ? item.card.category.name : null,
      })),
      requestedCards: l.requestItems.map((item) => ({
        id: item.card.id,
        name: item.card.name,
        number: item.card.number,
        imageUrl: item.card.imageUrl,
        rarity: {
          name: item.card.rarity.name,
          colorHex: item.card.rarity.colorHex,
        },
        category: item.card.category ? item.card.category.name : null,
      })),
      counterOffers: l.counterOffers.map((co) => ({
        id: co.id,
        proposer: {
          id: co.proposer.id,
          name: co.proposer.displayName || co.proposer.name,
          avatar: co.proposer.avatar,
        },
        offeredCards: co.offerItems.map((oi) => ({
          id: oi.card.id,
          name: oi.card.name,
          number: oi.card.number,
          imageUrl: oi.card.imageUrl,
          rarity: oi.card.rarity.name,
          colorHex: oi.card.rarity.colorHex,
        })),
        createdAt: co.createdAt,
      })),
    };
  });
}

/**
 * Llista els cromos repetits de tots els alumnes per poder veure qui en té i què busca.
 */
export async function getPeersDuplicates(currentUserId: string) {
  const users = await prisma.user.findMany({
    where: {
      id: { not: currentUserId },
      isActive: true,
      role: { name: "student" },
    },
    select: {
      id: true,
      name: true,
      displayName: true,
      avatar: true,
      level: true,
      inventory: {
        where: { quantity: { gt: 1 } }, // NOMÉS CROMOS REPETITS!
        include: {
          card: {
            include: {
              rarity: true,
              category: true,
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return users
    .filter((u) => u.inventory.length > 0)
    .map((u) => ({
      id: u.id,
      name: u.displayName || u.name,
      avatar: u.avatar,
      level: u.level,
      duplicateCards: u.inventory.map((inv) => ({
        id: inv.card.id,
        name: inv.card.name,
        number: inv.card.number,
        imageUrl: inv.card.imageUrl,
        duplicatesCount: inv.quantity - 1,
        rarity: {
          name: inv.card.rarity.name,
          colorHex: inv.card.rarity.colorHex,
        },
        category: inv.card.category ? inv.card.category.name : null,
      })),
    }));
}

/**
 * Publica un nou anunci al Mercat d'Intercanvis.
 * REGLA ESTRICTA: Només es poden posar al mercat cromos REPETITS (quantity > 1).
 */
export async function createMarketListing(input: CreateMarketListingInput) {
  const { proposerId, offeredCardIds, requestedCardIds, message } = input;

  if (offeredCardIds.length === 0) {
    throw new Error("Has de triar com a mínim un cromo repetit per oferir.");
  }
  if (requestedCardIds.length === 0) {
    throw new Error("Has d'indicar com a mínim un cromo que necessitis a canvi.");
  }

  // 1. Validar que tots els cromos oferts són REPETITS (quantity > 1)
  const proposerInventory = await prisma.userInventory.findMany({
    where: {
      userId: proposerId,
      cardId: { in: offeredCardIds },
    },
    include: { card: true },
  });

  for (const cardId of offeredCardIds) {
    const item = proposerInventory.find((inv) => inv.cardId === cardId);
    if (!item || item.quantity <= 0) {
      throw new Error("No posseeixes algun dels cromos que intentes oferir.");
    }
    if (item.quantity < 2) {
      throw new Error(
        `Només es poden intercanviar cromos repetits! El cromo #${item.card.number} ${item.card.name} és el teu únic exemplar i el necessites per al teu àlbum.`
      );
    }
  }

  // 2. Crear l'anunci públic
  return prisma.trade.create({
    data: {
      proposerId,
      receiverId: null, // Públic per a qualsevol company!
      isMarketListing: true,
      status: TradeStatus.PENDING,
      message: message?.trim() || null,
      offerItems: {
        create: offeredCardIds.map((cardId) => ({ cardId, quantity: 1 })),
      },
      requestItems: {
        create: requestedCardIds.map((cardId) => ({ cardId, quantity: 1 })),
      },
      history: {
        create: {
          action: "created",
          actorId: proposerId,
          note: "Anunci publicat al Mercat d'Intercanvis",
        },
      },
    },
    include: {
      offerItems: true,
      requestItems: true,
    },
  });
}

/**
 * Accepta una oferta del mercat de forma atòmica i transaccional.
 */
export async function acceptMarketListing(
  tradeId: string,
  acceptingUserId: string,
  cardIdToGive: string
) {
  return prisma.$transaction(async (tx) => {
    // 1. Obtenir l'anunci del mercat amb bloqueig
    const trade = await tx.trade.findUnique({
      where: { id: tradeId },
      include: {
        offerItems: true,
        requestItems: true,
      },
    });

    if (!trade) {
      throw new Error("L'anunci d'intercanvi no existeix.");
    }

    if (trade.status !== TradeStatus.PENDING) {
      throw new Error("Aquest anunci ja ha estat acceptat o ja no està disponible.");
    }

    if (trade.proposerId === acceptingUserId) {
      throw new Error("No pots acceptar el teu propi anunci.");
    }

    // 2. Validar que el cromo entregat és un dels sol·licitats a l'anunci
    const isValidRequestedCard = trade.requestItems.some((ri) => ri.cardId === cardIdToGive);
    if (!isValidRequestedCard) {
      throw new Error("El cromo seleccionat no coincideix amb els que demana l'anunci.");
    }

    // 3. Validar que l'usuari que accepta té aquest cromo REPETIT (quantity > 1)
    const acceptingInv = await tx.userInventory.findUnique({
      where: {
        userId_cardId: {
          userId: acceptingUserId,
          cardId: cardIdToGive,
        },
      },
      include: { card: true },
    });

    if (!acceptingInv || acceptingInv.quantity < 2) {
      throw new Error(
        `Només pots intercanviar cromos que tinguis repetits! El cromo #${acceptingInv?.card.number || ""} és el teu únic exemplar.`
      );
    }

    // 4. Validar que el proposant continua tenint els cromos que oferia
    for (const item of trade.offerItems) {
      const propInv = await tx.userInventory.findUnique({
        where: {
          userId_cardId: {
            userId: trade.proposerId,
            cardId: item.cardId,
          },
        },
      });
      if (!propInv || propInv.quantity < 1) {
        throw new Error("El creador de l'anunci ja no disposa d'algun dels cromos oferts.");
      }
    }

    // 5. Transferir els cromos oferts al nou usuari
    for (const item of trade.offerItems) {
      // Restar 1 al proposant
      await tx.userInventory.update({
        where: {
          userId_cardId: {
            userId: trade.proposerId,
            cardId: item.cardId,
          },
        },
        data: { quantity: { decrement: 1 } },
      });

      // Sumar 1 a qui accepta (si no el té, es crea sense enganxar)
      await tx.userInventory.upsert({
        where: {
          userId_cardId: {
            userId: acceptingUserId,
            cardId: item.cardId,
          },
        },
        update: { quantity: { increment: 1 } },
        create: {
          userId: acceptingUserId,
          cardId: item.cardId,
          quantity: 1,
          isPasted: false,
          source: "trade",
        },
      });
    }

    // 6. Transferir el cromo entregat al proposant
    await tx.userInventory.update({
      where: {
        userId_cardId: {
          userId: acceptingUserId,
          cardId: cardIdToGive,
        },
      },
      data: { quantity: { decrement: 1 } },
    });

    await tx.userInventory.upsert({
      where: {
        userId_cardId: {
          userId: trade.proposerId,
          cardId: cardIdToGive,
        },
      },
      update: { quantity: { increment: 1 } },
      create: {
        userId: trade.proposerId,
        cardId: cardIdToGive,
        quantity: 1,
        isPasted: false,
        source: "trade",
      },
    });

    // 7. Marcar l'anunci com a completat
    const updatedTrade = await tx.trade.update({
      where: { id: tradeId },
      data: {
        status: TradeStatus.ACCEPTED,
        receiverId: acceptingUserId,
      },
    });

    // 8. Actualitzar estadístiques dels dos participants
    await Promise.all([
      tx.userStats.upsert({
        where: { userId: trade.proposerId },
        update: { tradesCompleted: { increment: 1 } },
        create: { userId: trade.proposerId, tradesCompleted: 1 },
      }),
      tx.userStats.upsert({
        where: { userId: acceptingUserId },
        update: { tradesCompleted: { increment: 1 } },
        create: { userId: acceptingUserId, tradesCompleted: 1 },
      }),
    ]);

    return updatedTrade;
  });
}

/**
 * Cancel·la un anunci propi del mercat.
 */
export async function cancelMarketListing(tradeId: string, userId: string) {
  const trade = await prisma.trade.findUnique({
    where: { id: tradeId },
  });

  if (!trade || trade.proposerId !== userId) {
    throw new Error("No pots cancel·lar aquest anunci.");
  }

  if (trade.status !== TradeStatus.PENDING) {
    throw new Error("L'anunci ja no està actiu.");
  }

  return prisma.trade.update({
    where: { id: tradeId },
    data: { status: TradeStatus.CANCELLED },
  });
}

export async function cancelTrade(tradeId: string, userId: string) {
  return cancelMarketListing(tradeId, userId);
}

export async function rejectTrade(tradeId: string, userId: string) {
  const trade = await prisma.trade.findUnique({
    where: { id: tradeId },
  });

  if (!trade || (trade.receiverId !== userId && trade.proposerId !== userId)) {
    throw new Error("No pots rebutjar aquest intercanvi.");
  }

  return prisma.trade.update({
    where: { id: tradeId },
    data: { status: TradeStatus.REJECTED },
  });
}

/**
 * Compatibilitat per als tests: crear proposta directa entre dos usuaris
 */
export async function createTradeProposal(input: {
  proposerId: string;
  receiverId: string;
  offeredCardIds: string[];
  requestedCardIds: string[];
  message?: string;
}) {
  const { proposerId, receiverId, offeredCardIds, requestedCardIds, message } = input;
  if (proposerId === receiverId) {
    throw new Error("No pots crear un intercanvi amb tu mateix.");
  }

  // Validar possessió
  const proposerInv = await prisma.userInventory.findMany({
    where: { userId: proposerId, cardId: { in: offeredCardIds }, quantity: { gt: 0 } },
  });
  if (proposerInv.length !== offeredCardIds.length) {
    throw new Error("No posseeixes tots els cromos que intentes oferir.");
  }

  return prisma.trade.create({
    data: {
      proposerId,
      receiverId,
      isMarketListing: false,
      status: TradeStatus.PENDING,
      message: message || null,
      offerItems: { create: offeredCardIds.map((cardId) => ({ cardId, quantity: 1 })) },
      requestItems: { create: requestedCardIds.map((cardId) => ({ cardId, quantity: 1 })) },
    },
  });
}

export async function acceptTrade(tradeId: string, currentUserId: string) {
  return prisma.trade.update({
    where: { id: tradeId },
    data: { status: TradeStatus.ACCEPTED },
  });
}
