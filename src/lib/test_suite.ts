import { prisma } from "@/lib/db";
import { isAllowedDomain } from "@/lib/auth";
import { submitAnswer, getUserDailyQuestionStatus } from "@/services/question.service";
import { createTradeProposal, acceptTrade } from "@/services/trade.service";

async function runTestSuite() {
  console.log("====================================================");
  console.log("🛡️ SUITE DE TESTS DE SEGURETAT I FUNCIONALITAT ILUSTRUM");
  console.log("====================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // --- TEST 1: Seguretat del Domini ---
  console.log("1. Validació de Domini @lacetania.cat:");
  assert(isAllowedDomain("alumne@lacetania.cat") === true, "Permet compte legítim @lacetania.cat");
  assert(isAllowedDomain("professor@lacetania.cat") === true, "Permet compte professor @lacetania.cat");
  assert(isAllowedDomain("hacker@gmail.com") === false, "Rebutja compte extern @gmail.com");
  assert(isAllowedDomain("alumne@lacetania.cat.fake.com") === false, "Rebutja intent de phishing/subdomini fals");
  assert(isAllowedDomain("") === false, "Rebutja correu buit");

  // --- TEST 2: Validació i càlcul de puntuació server-side ---
  console.log("\n2. Càlcul de Puntuació i Prevenció de Manipulació:");
  const testStudent = await prisma.user.findFirst({
    where: { email: "alumne.demo@lacetania.cat" },
  });
  const testQuestion = await prisma.question.findFirst({
    where: { isActive: true },
    include: { answers: true },
  });

  if (testStudent && testQuestion) {
    await prisma.questionAttempt.deleteMany({
      where: { userId: testStudent.id },
    });
    const wrongAnswer = testQuestion.answers.find((a) => !a.isCorrect);
    const rightAnswer = testQuestion.answers.find((a) => a.isCorrect);

    if (wrongAnswer) {
      const resWrong = await submitAnswer(testStudent.id, testQuestion.id, wrongAnswer.id, 5);
      assert(resWrong.isCorrect === false, "Detecta resposta incorrecta al servidor");
      assert(resWrong.pointsEarned === 0, "No atorga punts en resposta errònia");
      assert(resWrong.cardsWonCount === 0, "No atorga cap cromo en fallar (0 cromos)");
    }

    if (rightAnswer) {
      const resRight = await submitAnswer(testStudent.id, testQuestion.id, rightAnswer.id, 8);
      assert(resRight.isCorrect === true, "Detecta resposta correcta al servidor");
      assert(resRight.pointsEarned === testQuestion.points, "Puntuació calculada per la regla del servidor");
      assert(typeof resRight.currentPoints === "number", "Actualitza els punts globals de l'alumne");
      assert(resRight.cardsWonCount === 3, "Atorga exactament 3 cromos si s'encerta en els 10 primers segons (0-10s)");

      const resTier2 = await submitAnswer(testStudent.id, testQuestion.id, rightAnswer.id, 13);
      assert(resTier2.cardsWonCount === 2, "Atorga exactament 2 cromos si s'encerta entre el segon 10 i 15 (10-15s)");

      const resTier3 = await submitAnswer(testStudent.id, testQuestion.id, rightAnswer.id, 18);
      assert(resTier3.cardsWonCount === 1, "Atorga exactament 1 cromo si s'encerta en els últims 5 segons (15-20s)");
    }
  }

  // --- TEST 3: Integritat Referencial i Transaccions ACID ---
  console.log("\n3. Transaccions ACID d'Intercanvi:");
  const userA = await prisma.user.findFirst({ where: { email: "alumne.demo@lacetania.cat" } });
  const userB = await prisma.user.findFirst({ where: { email: "professor.demo@lacetania.cat" } });

  if (userA && userB) {
    const card1 = await prisma.card.findFirst({ where: { number: 1 } });
    const card2 = await prisma.card.findFirst({ where: { number: 2 } });

    if (card1 && card2) {
      // Intentar intercanviar un cromo que NO es té ha de fallar
      let blockedFakeTrade = false;
      try {
        await createTradeProposal({
          proposerId: userA.id,
          receiverId: userB.id,
          offeredCardIds: ["cromo-inexistent-fake-id"],
          requestedCardIds: [card2.id],
        });
      } catch {
        blockedFakeTrade = true;
      }
      assert(blockedFakeTrade === true, "Bloqueja propostes amb cromos no posseïts");

      // Auto-intercanvi amb un mateix ha de fallar
      let blockedSelfTrade = false;
      try {
        await createTradeProposal({
          proposerId: userA.id,
          receiverId: userA.id,
          offeredCardIds: [card1.id],
          requestedCardIds: [card2.id],
        });
      } catch {
        blockedSelfTrade = true;
      }
      assert(blockedSelfTrade === true, "Bloqueja intents d'auto-intercanvi (proposer === receiver)");
    }
  }

  // --- TEST 4: Control de Permisos Administratius ---
  console.log("\n4. Permisos Administratius:");
  const adminUser = await prisma.user.findFirst({
    where: { role: { name: "admin" } },
    include: { role: true },
  });
  const normalStudent = await prisma.user.findFirst({
    where: { role: { name: "student" } },
    include: { role: true },
  });

  assert(adminUser?.role.name === "admin", "Verifica existència d'usuari administrador");
  assert(normalStudent?.role.name === "student", "Verifica existència d'usuari amb rol alumne");
  assert(
    adminUser?.email.toLowerCase() === "ramon.clemente@lacetania.cat",
    "Exclusivitat admin: ramon.clemente@lacetania.cat és l'únic administrador"
  );

  // --- TEST 5: Límit Diari de Preguntes ---
  console.log("\n5. Límit Diari de Preguntes (10 al dia per a alumnes, il·limitat a les proves):");
  if (adminUser) {
    const adminDaily = await getUserDailyQuestionStatus(adminUser.id);
    assert(adminDaily.isUnlimited === true, "Mode proves/admin gaudeix de preguntes il·limitades");
  }

  if (normalStudent) {
    const studentDaily = await getUserDailyQuestionStatus(normalStudent.id);
    assert(studentDaily.isUnlimited === false, "Alumne real té límit diari actiu");
    assert(studentDaily.dailyLimit === 10, "El límit diari per defecte és de 10 preguntes");
    assert(typeof studentDaily.remainingToday === "number", "Calcula correctament les preguntes restants d'avui");
  }

  // --- TEST 6: Distribució Estricta de Rareses ---
  console.log("\n6. Validació de Rareses (75% Comú, 18% Poc comú, 5% Rar, 1.8% Èpic, 0.2% Llegendari):");
  const commonR = await prisma.rarity.findUnique({ where: { nameKey: "common" } });
  const uncommonR = await prisma.rarity.findUnique({ where: { nameKey: "uncommon" } });
  const rareR = await prisma.rarity.findUnique({ where: { nameKey: "rare" } });
  const epicR = await prisma.rarity.findUnique({ where: { nameKey: "epic" } });
  const legendaryR = await prisma.rarity.findUnique({ where: { nameKey: "legendary" } });

  assert(commonR?.probability === 0.75, "Raresa Comuna fixada al 75%");
  assert(uncommonR?.probability === 0.18, "Raresa Poc Comuna fixada al 18%");
  assert(rareR?.probability === 0.05, "Raresa Rara fixada al 5%");
  assert(epicR?.probability === 0.018, "Raresa Èpica fixada a l'1.8%");
  assert(legendaryR?.probability === 0.002, "Raresa Llegendària fixada al 0.2%");

  // --- TEST 7: Mercat d'Intercanvis - Només Cromos Repetits ---
  console.log("\n7. Mercat d'Intercanvis (Regla de cromos repetits):");
  const { createMarketListing } = await import("@/services/trade.service");
  if (testStudent) {
    // Si intentem oferir un cromo que té quantitat 1 (únic), ha de ser rebutjat
    const singleCard = await prisma.card.findFirst({ where: { number: 10 } });
    const wantedCard = await prisma.card.findFirst({ where: { number: 12 } });

    if (singleCard && wantedCard) {
      await prisma.userInventory.upsert({
        where: { userId_cardId: { userId: testStudent.id, cardId: singleCard.id } },
        update: { quantity: 1 },
        create: { userId: testStudent.id, cardId: singleCard.id, quantity: 1 },
      });

      let blockedSingleTrade = false;
      try {
        await createMarketListing({
          proposerId: testStudent.id,
          offeredCardIds: [singleCard.id],
          requestedCardIds: [wantedCard.id],
        });
      } catch {
        blockedSingleTrade = true;
      }
      assert(blockedSingleTrade === true, "Bloqueja posar al mercat un cromo únic que no estigui repetit");
    }
  }

  console.log("\n====================================================");
  console.log(`📊 RESULTAT GLOBAL: ${passed} PASSATS | ${failed} FALLATS`);
  console.log("====================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Error executant la suite de tests:", e);
    process.exit(1);
  });
