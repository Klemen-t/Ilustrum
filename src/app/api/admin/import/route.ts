import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

// Plantilla d'exemple per descarregar
const SAMPLE_IMPORT_TEMPLATE = {
  album: {
    id: "album-smix-m01-hardware",
    name: "Hardware & Muntatge d'Equips (SMIX M01)",
    description: "Col·lecció completa dels components hardware, arquitectura de computadors i eines de taller del cicle SMIX.",
    sortOrder: 1,
  },
  subjects: [
    {
      name: "M01: Muntatge i manteniment d'equips",
      slug: "smix-m01-mme",
      color: "#f59e0b",
    },
    {
      name: "M02: Sistemes operatius monolloc",
      slug: "smix-m02-som",
      color: "#3b82f6",
    },
    {
      name: "M05: Xarxes locals",
      slug: "smix-m05-xl",
      color: "#10b981",
    },
  ],
  categories: [
    {
      name: "Processadors & Sòcols",
      slug: "cpu-sockets",
      color: "#ef4444",
      icon: "cpu",
    },
    {
      name: "Memòria & Emmagatzematge",
      slug: "ram-storage",
      color: "#3b82f6",
      icon: "hard-drive",
    },
  ],
  cards: [
    {
      number: 1,
      name: "Intel Core i9-14900K",
      description: "Processador de 24 nuclis (8P + 16E) i 32 fils amb freqüència de fins a 6.0 GHz a sòcol LGA1700.",
      rarityName: "Llegendari",
      categorySlug: "cpu-sockets",
      imageUrl: "",
      value: 100,
    },
    {
      number: 2,
      name: "AMD Ryzen 9 7950X",
      description: "Processador basat en arquitectura Zen 4 de 16 nuclis i 32 fils a sòcol AM5.",
      rarityName: "Èpic",
      categorySlug: "cpu-sockets",
      imageUrl: "",
      value: 75,
    },
  ],
  questions: [
    {
      statement: "A quin sòcol (socket) es connecten els processadors Intel de 12a, 13a i 14a generació de sobretaula?",
      difficulty: "medium",
      points: 15,
      xpReward: 20,
      explanation: "Utilitzen el sòcol LGA1700 (Land Grid Array amb 1700 pins al sòcol).",
      subjectSlug: "smix-m01-mme",
      categorySlug: "cpu-sockets",
      answers: [
        { text: "LGA1200", isCorrect: false },
        { text: "LGA1700", isCorrect: true },
        { text: "AM4", isCorrect: false },
        { text: "AM5", isCorrect: false },
      ],
    },
  ],
};

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json({
      template: SAMPLE_IMPORT_TEMPLATE,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "No autoritzat" }, { status: 403 });
  }
}

export async function POST(request: NextRequest) {
  let adminUser;
  try {
    adminUser = await requireAdmin();
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "No autoritzat" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { album, subjects, categories, cards, questions } = body;

    if (!album || !album.name) {
      return NextResponse.json(
        { error: "L'objecte 'album' amb el camp 'name' és obligatori." },
        { status: 400 }
      );
    }

    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json(
        { error: "La llista 'cards' ha de contenir almenys un cromo." },
        { status: 400 }
      );
    }

    const rarities = await prisma.rarity.findMany();
    const rarityMap = new Map<string, number>();
    for (const r of rarities) {
      rarityMap.set(r.name.toLowerCase().trim(), r.id);
      rarityMap.set(r.nameKey.toLowerCase().trim(), r.id);
    }

    // Executar importació en transacció
    const result = await prisma.$transaction(async (tx) => {
      // 1. Assignatures (opcionals)
      if (subjects && Array.isArray(subjects)) {
        for (const s of subjects) {
          if (s.name && s.slug) {
            await tx.subject.upsert({
              where: { slug: s.slug },
              update: { name: s.name, color: s.color || "#6366f1" },
              create: { name: s.name, slug: s.slug, color: s.color || "#6366f1" },
            });
          }
        }
      }

      // 2. Categories (opcionals)
      if (categories && Array.isArray(categories)) {
        for (const c of categories) {
          if (c.name && c.slug) {
            await tx.category.upsert({
              where: { slug: c.slug },
              update: { name: c.name, color: c.color || "#8b5cf6", icon: c.icon || "tag" },
              create: { name: c.name, slug: c.slug, color: c.color || "#8b5cf6", icon: c.icon || "tag" },
            });
          }
        }
      }

      // 3. Crear o Actualitzar Àlbum
      const albumId = album.id || `album-${Date.now()}`;
      const savedAlbum = await tx.album.upsert({
        where: { id: albumId },
        update: {
          name: album.name,
          description: album.description || null,
          totalCards: cards.length,
          sortOrder: album.sortOrder || 1,
          isActive: true,
        },
        create: {
          id: albumId,
          name: album.name,
          description: album.description || null,
          totalCards: cards.length,
          sortOrder: album.sortOrder || 1,
          isActive: true,
        },
      });

      // 4. Crear Pàgines d'Àlbum necessàries (10 cromos per pàgina)
      const maxNumber = Math.max(...cards.map((c) => c.number || 1));
      const totalPagesNeeded = Math.max(1, Math.ceil(maxNumber / 10));
      const pageMap = new Map<number, string>();

      for (let pNum = 1; pNum <= totalPagesNeeded; pNum++) {
        const page = await tx.albumPage.upsert({
          where: { albumId_pageNum: { albumId: savedAlbum.id, pageNum: pNum } },
          update: { layout: "grid-5x2" },
          create: {
            albumId: savedAlbum.id,
            pageNum: pNum,
            layout: "grid-5x2",
          },
        });
        pageMap.set(pNum, page.id);
      }

      // 5. Crear / Actualitzar Cromos
      let cardsCreated = 0;
      for (const cardData of cards) {
        const cardNum = Number(cardData.number);
        const rarityKey = (cardData.rarityName || "Comú").toLowerCase().trim();
        const rarityId = rarityMap.get(rarityKey) || rarities[0].id;

        // Categoria
        let categoryId: number | null = null;
        if (cardData.categorySlug) {
          const cat = await tx.category.findUnique({ where: { slug: cardData.categorySlug } });
          if (cat) categoryId = cat.id;
        }

        // Pàgina
        const calculatedPageNum = cardData.pageNum || Math.ceil(cardNum / 10);
        const pageId = pageMap.get(calculatedPageNum) || Array.from(pageMap.values())[0];

        await tx.card.upsert({
          where: { albumId_number: { albumId: savedAlbum.id, number: cardNum } },
          update: {
            name: cardData.name,
            description: cardData.description || null,
            imageUrl: cardData.imageUrl || null,
            rarityId,
            categoryId,
            pageId,
            value: cardData.value || 25,
            isActive: true,
          },
          create: {
            albumId: savedAlbum.id,
            number: cardNum,
            name: cardData.name,
            description: cardData.description || null,
            imageUrl: cardData.imageUrl || null,
            rarityId,
            categoryId,
            pageId,
            value: cardData.value || 25,
            isActive: true,
          },
        });
        cardsCreated++;
      }

      // 6. Crear / Actualitzar Preguntes
      let questionsCreated = 0;
      if (questions && Array.isArray(questions)) {
        for (const q of questions) {
          if (!q.statement || !q.answers || q.answers.length === 0) continue;

          // Obtenir assignatura
          let subjectId: number | null = null;
          if (q.subjectSlug) {
            const sub = await tx.subject.findUnique({ where: { slug: q.subjectSlug } });
            if (sub) subjectId = sub.id;
          }

          // Obtenir categoria
          let categoryId: number | null = null;
          if (q.categorySlug) {
            const cat = await tx.category.findUnique({ where: { slug: q.categorySlug } });
            if (cat) categoryId = cat.id;
          }

          const createdQuestion = await tx.question.create({
            data: {
              statement: q.statement,
              difficulty: q.difficulty || "medium",
              points: q.points || 10,
              xpReward: q.xpReward || 15,
              explanation: q.explanation || null,
              subjectId,
              categoryId,
              recommendedTime: 20, // 20 segons per defecte
              isActive: true,
            },
          });

          // Crear respostes
          for (let i = 0; i < q.answers.length; i++) {
            const ans = q.answers[i];
            await tx.answer.create({
              data: {
                questionId: createdQuestion.id,
                text: ans.text,
                isCorrect: !!ans.isCorrect,
                sortOrder: i + 1,
              },
            });
          }

          questionsCreated++;
        }
      }

      // 7. Registre d'auditoria
      await tx.activityLog.create({
        data: {
          userId: adminUser.id,
          action: "IMPORT_ALBUM",
          entity: "album",
          entityId: savedAlbum.id,
          metadata: JSON.stringify({
            albumName: savedAlbum.name,
            cardsImported: cardsCreated,
            questionsImported: questionsCreated,
          }),
        },
      });

      return {
        albumId: savedAlbum.id,
        albumName: savedAlbum.name,
        cardsCreated,
        questionsCreated,
        pagesCreated: totalPagesNeeded,
      };
    });

    return NextResponse.json({
      success: true,
      message: `S'ha importat correctament l'àlbum '${result.albumName}' amb ${result.cardsCreated} cromos i ${result.questionsCreated} preguntes.`,
      result,
    });
  } catch (error: any) {
    console.error("Error en la importació:", error);
    return NextResponse.json(
      { error: error.message || "Error durant la importació del paquet." },
      { status: 500 }
    );
  }
}
