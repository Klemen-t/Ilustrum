import { prisma } from "@/lib/db";

export interface RandomQuestionResult {
  id: string;
  statement: string;
  difficulty: string;
  points: number;
  xpReward: number;
  recommendedTime: number;
  category: { id: number; name: string; color: string; icon: string | null } | null;
  subject: { id: number; name: string; color: string } | null;
  answers: { id: string; text: string; sortOrder: number }[]; // SENSE isCorrect!
}

export interface CardWonItem {
  id: string;
  name: string;
  number: number;
  description: string | null;
  imageUrl: string | null;
  value: number;
  rarity: {
    name: string;
    colorHex: string;
    glowColor: string;
    sortOrder: number;
  };
  category: {
    name: string;
    color: string;
  } | null;
  isDuplicate: boolean;
  quantityTotal: number;
}

export interface AnswerResult {
  isCorrect: boolean;
  explanation: string | null;
  pointsEarned: number;
  xpEarned: number;
  currentPoints: number;
  currentXp: number;
  currentLevel: number;
  levelUp: boolean;
  secondsUsed: number;
  cardsWonCount: number;
  cardsWon: CardWonItem[];
  cardWon?: CardWonItem;
}

export interface DailyQuestionStatus {
  dailyLimit: number;
  attemptsToday: number;
  remainingToday: number;
  isUnlimited: boolean;
  canAnswer: boolean;
}

/**
 * Consulta l'estat del límit diari de preguntes per a un usuari.
 * Regla:
 * - A les proves (admin, professor, dev-user o flag testing_mode_unlimited_questions = true): preguntes il·limitades.
 * - Pels alumnes normals: límit diari configurable (per defecte 10 preguntes per dia natural).
 */
export async function getUserDailyQuestionStatus(userId: string): Promise<DailyQuestionStatus> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });

  if (!user) {
    throw new Error("Usuari no trobat");
  }

  // Comprovar si està en mode de proves il·limitat
  const testingModeConfig = await prisma.appConfig.findUnique({
    where: { key: "testing_mode_unlimited_questions" },
  });

  const isTestingMode = testingModeConfig?.value === "true";
  const isPrivilegedUser =
    user.role.name === "admin" ||
    user.role.name === "teacher" ||
    user.email === "dev-user@lacetania.cat" ||
    user.email === "ramon.clemente@lacetania.cat";

  if (isTestingMode || isPrivilegedUser) {
    return {
      dailyLimit: 0,
      attemptsToday: 0,
      remainingToday: 9999,
      isUnlimited: true,
      canAnswer: true,
    };
  }

  // Obtenir límit diari des d'AppConfig (per defecte 10)
  const limitConfig = await prisma.appConfig.findUnique({
    where: { key: "daily_question_limit" },
  });
  const dailyLimit = limitConfig ? parseInt(limitConfig.value, 10) || 10 : 10;

  // Comptar intents d'avui (des de les 00:00:00 hora local)
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const attemptsToday = await prisma.questionAttempt.count({
    where: {
      userId,
      attemptedAt: { gte: startOfDay },
    },
  });

  const remainingToday = Math.max(0, dailyLimit - attemptsToday);
  const canAnswer = remainingToday > 0;

  return {
    dailyLimit,
    attemptsToday,
    remainingToday,
    isUnlimited: false,
    canAnswer,
  };
}

/**
 * Obté una pregunta per a l'usuari seguint les regles pedagògiques:
 * 1. Prioritza preguntes que l'usuari NO ha contestat mai correctament.
 * 2. D'aquestes, prioritza les que encara no ha intentat mai.
 * 3. Si ja ha contestat totes les preguntes correctament (no en queden de noves),
 *    fa sortir les preguntes que ha fallat més cops per reforçar l'aprenentatge.
 */
export async function getRandomQuestion(userId: string): Promise<RandomQuestionResult | null> {
  // 1. Obtenir els IDs de les preguntes que l'usuari JA ha encertat
  const correctAttempts = await prisma.questionAttempt.findMany({
    where: { userId, isCorrect: true },
    select: { questionId: true },
    distinct: ["questionId"],
  });
  const correctlyAnsweredIds = correctAttempts.map((a) => a.questionId);

  // 2. Cercar preguntes actives que NO han estat encertades mai per aquest usuari
  const unmasteredQuestions = await prisma.question.findMany({
    where: {
      isActive: true,
      id: { notIn: correctlyAnsweredIds },
    },
    include: {
      category: true,
      subject: true,
      answers: true,
    },
  });

  let selected: (typeof unmasteredQuestions)[0] | null = null;

  if (unmasteredQuestions.length > 0) {
    // Obtenir preguntes que ha intentat (i fallat)
    const failedAttemptIds = await prisma.questionAttempt.findMany({
      where: { userId, isCorrect: false },
      select: { questionId: true },
      distinct: ["questionId"],
    });
    const failedSet = new Set(failedAttemptIds.map((f) => f.questionId));

    // Prioritzar primer les que no ha intentat MAI
    const neverAttempted = unmasteredQuestions.filter((q) => !failedSet.has(q.id));

    if (neverAttempted.length > 0) {
      selected = neverAttempted[Math.floor(Math.random() * neverAttempted.length)];
    } else {
      // Totes les no encertades ja s'han intentat (han estat fallades): triar a l'atzar d'aquestes
      selected = unmasteredQuestions[Math.floor(Math.random() * unmasteredQuestions.length)];
    }
  } else {
    // 3. No queden preguntes per encertar: totes han estat contestades correctament almenys un cop!
    // Farem sortir les preguntes que l'alumne ha fallat MÉS cops
    const failCounts = await prisma.questionAttempt.groupBy({
      by: ["questionId"],
      where: { userId, isCorrect: false },
      _count: { questionId: true },
      orderBy: {
        _count: {
          questionId: "desc",
        },
      },
    });

    if (failCounts.length > 0) {
      // Obtenir la pregunta o grup de preguntes amb el màxim de fallades
      const maxFails = failCounts[0]._count.questionId;
      const topFailedQuestionIds = failCounts
        .filter((fc) => fc._count.questionId === maxFails)
        .map((fc) => fc.questionId);

      const candidateQuestions = await prisma.question.findMany({
        where: {
          isActive: true,
          id: { in: topFailedQuestionIds },
        },
        include: {
          category: true,
          subject: true,
          answers: true,
        },
      });

      if (candidateQuestions.length > 0) {
        selected = candidateQuestions[Math.floor(Math.random() * candidateQuestions.length)];
      }
    }

    // Si encara no hem seleccionat res (ex. alumne que no ha fallat mai cap pregunta)
    if (!selected) {
      const allActive = await prisma.question.findMany({
        where: { isActive: true },
        include: {
          category: true,
          subject: true,
          answers: true,
        },
      });

      if (allActive.length > 0) {
        selected = allActive[Math.floor(Math.random() * allActive.length)];
      }
    }
  }

  if (!selected) {
    return null;
  }

  // 4. Barrejar les respostes i AMAGAR `isCorrect` per seguretat
  const shuffledAnswers = selected.answers
    .map((a) => ({ id: a.id, text: a.text, sortOrder: a.sortOrder }))
    .sort(() => Math.random() - 0.5);

  return {
    id: selected.id,
    statement: selected.statement,
    difficulty: selected.difficulty,
    points: selected.points,
    xpReward: selected.xpReward,
    recommendedTime: selected.recommendedTime,
    category: selected.category
      ? {
          id: selected.category.id,
          name: selected.category.name,
          color: selected.category.color,
          icon: selected.category.icon,
        }
      : null,
    subject: selected.subject
      ? {
          id: selected.subject.id,
          name: selected.subject.name,
          color: selected.subject.color,
        }
      : null,
    answers: shuffledAnswers,
  };
}

/**
 * Valida la resposta d'una pregunta al servidor, calcula puntuació,
 * experiència, pujades de nivell i llença la probabilitat de guanyar un cromo.
 */
export async function submitAnswer(
  userId: string,
  questionId: string,
  answerId: string,
  secondsUsed: number = 10
): Promise<AnswerResult> {
  // Validació del límit diari de preguntes
  const dailyStatus = await getUserDailyQuestionStatus(userId);
  if (!dailyStatus.canAnswer) {
    throw new Error(
      `Has assolit el límit diari de ${dailyStatus.dailyLimit} preguntes per avui. Torna demà per continuar guanyant cromos!`
    );
  }

  const [user, question, answer] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { stats: true },
    }),
    prisma.question.findUnique({
      where: { id: questionId },
      include: { answers: true },
    }),
    prisma.answer.findUnique({
      where: { id: answerId },
    }),
  ]);

  if (!user || !user.isActive) {
    throw new Error("Usuari no trobat o inactiu");
  }

  if (!question || !question.isActive) {
    throw new Error("Pregunta no trobada o inactiva");
  }

  if (!answer || answer.questionId !== questionId) {
    throw new Error("Resposta no vàlida per a aquesta pregunta");
  }

  const isCorrect = answer.isCorrect;
  const pointsEarned = isCorrect ? question.points : 0;
  const xpEarned = isCorrect ? question.xpReward : 2; // 2 XP de consolació per esforç

  // 1. Registrar l'intent a la base de dades
  await prisma.questionAttempt.create({
    data: {
      userId: user.id,
      questionId: question.id,
      answerId: answer.id,
      isCorrect,
      pointsEarned,
      xpEarned,
    },
  });

  // 2. Càlcul de nivell i experiència
  let newXp = user.xp + xpEarned;
  let newLevel = user.level;
  let newXpToNextLevel = user.xpToNextLevel;
  let levelUp = false;

  while (newXp >= newXpToNextLevel) {
    newLevel += 1;
    newXp = newXp - newXpToNextLevel;
    newXpToNextLevel = Math.round(100 * Math.pow(newLevel, 1.5));
    levelUp = true;
  }

  const updatedPoints = user.points + pointsEarned;
  const updatedTotalPoints = user.totalPoints + pointsEarned;

  // Actualitzar l'usuari a la BD
  await prisma.user.update({
    where: { id: user.id },
    data: {
      points: updatedPoints,
      totalPoints: updatedTotalPoints,
      level: newLevel,
      xp: newXp,
      xpToNextLevel: newXpToNextLevel,
    },
  });

  // 3. Actualitzar estadístiques de l'usuari (user_stats)
  if (user.stats) {
    await prisma.userStats.update({
      where: { id: user.stats.id },
      data: {
        totalAnswers: { increment: 1 },
        correctAnswers: isCorrect ? { increment: 1 } : undefined,
        lastActivityDate: new Date(),
      },
    });
  }

  const cardsWon: CardWonItem[] = [];
  const normalizedTime = Math.max(0, Number(secondsUsed) || 10);

  // 4. Càlcul de cromos guanyats segons el temps de resposta:
  // - 20 segons per respondre
  // - Encert en els 10 primers segons (0 - 10s): 3 cromos
  // - Encert del segon 10 al 15 (10 - 15s): 2 cromos
  // - Encert en els últims 5 segons (15 - 20s): 1 cromo
  // - Error o més de 20 segons: 0 cromos
  let cardsToAward = 0;
  if (isCorrect) {
    if (normalizedTime <= 10) {
      cardsToAward = 3;
    } else if (normalizedTime <= 15) {
      cardsToAward = 2;
    } else if (normalizedTime <= 20) {
      cardsToAward = 1;
    } else {
      cardsToAward = 0; // Temps esgotat
    }
  }

  if (cardsToAward > 0) {
    const rarities = await prisma.rarity.findMany({
      orderBy: { sortOrder: "asc" },
    });

    for (let i = 0; i < cardsToAward; i++) {
      // Determinar raresa segons les probabilitats configurades
      const rarityRoll = Math.random();
      let cumulative = 0;
      let selectedRarity = rarities[0];

      for (const r of rarities) {
        cumulative += r.probability;
        if (rarityRoll <= cumulative) {
          selectedRarity = r;
          break;
        }
      }

      // Buscar cromos actius d'aquesta raresa (o qualsevol actiu si no n'hi ha d'aquesta)
      let candidateCards = await prisma.card.findMany({
        where: {
          rarityId: selectedRarity.id,
          isActive: true,
        },
        include: {
          rarity: true,
          category: true,
        },
      });

      if (candidateCards.length === 0) {
        candidateCards = await prisma.card.findMany({
          where: { isActive: true },
          include: {
            rarity: true,
            category: true,
          },
        });
      }

      if (candidateCards.length > 0) {
        // Seleccionar cromo a l'atzar
        const chosenCard = candidateCards[Math.floor(Math.random() * candidateCards.length)];

        // Comprovar si l'usuari ja té el cromo a l'inventari
        const existingInventory = await prisma.userInventory.findUnique({
          where: {
            userId_cardId: {
              userId: user.id,
              cardId: chosenCard.id,
            },
          },
        });

        const isDuplicate = !!existingInventory;
        let quantityTotal = 1;

        if (existingInventory) {
          quantityTotal = existingInventory.quantity + 1;
          await prisma.userInventory.update({
            where: { id: existingInventory.id },
            data: { quantity: quantityTotal },
          });
        } else {
          await prisma.userInventory.create({
            data: {
              userId: user.id,
              cardId: chosenCard.id,
              quantity: 1,
              source: "question",
            },
          });

          if (user.stats) {
            await prisma.userStats.update({
              where: { id: user.stats.id },
              data: {
                uniqueCards: { increment: 1 },
                totalCards: { increment: 1 },
              },
            });
          }
        }

        cardsWon.push({
          id: chosenCard.id,
          name: chosenCard.name,
          number: chosenCard.number,
          description: chosenCard.description,
          imageUrl: chosenCard.imageUrl,
          value: chosenCard.value,
          rarity: {
            name: chosenCard.rarity.name,
            colorHex: chosenCard.rarity.colorHex,
            glowColor: chosenCard.rarity.glowColor,
            sortOrder: chosenCard.rarity.sortOrder,
          },
          category: chosenCard.category
            ? {
                name: chosenCard.category.name,
                color: chosenCard.category.color,
              }
            : null,
          isDuplicate,
          quantityTotal,
        });
      }
    }

    // Comprovar insígnia de primer cromo si n'ha guanyat algun
    if (cardsWon.length > 0) {
      const firstCardBadge = await prisma.badge.findFirst({
        where: { name: "Primer Cromo Descobert" },
      });

      if (firstCardBadge) {
        const hasBadge = await prisma.userBadge.findUnique({
          where: {
            userId_badgeId: {
              userId: user.id,
              badgeId: firstCardBadge.id,
            },
          },
        });

        if (!hasBadge) {
          await prisma.userBadge.create({
            data: {
              userId: user.id,
              badgeId: firstCardBadge.id,
            },
          });
        }
      }
    }
  }

  return {
    isCorrect,
    explanation: question.explanation,
    pointsEarned,
    xpEarned,
    currentPoints: updatedPoints,
    currentXp: newXp,
    currentLevel: newLevel,
    levelUp,
    secondsUsed: normalizedTime,
    cardsWonCount: cardsWon.length,
    cardsWon,
    cardWon: cardsWon[0] || undefined,
  };
}
