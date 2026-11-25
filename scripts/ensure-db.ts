import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Comprovant estat de la base de dades...");
  
  try {
    const cardCount = await prisma.card.count();
    console.log(`📊 Cromos a la base de dades: ${cardCount}`);

    if (cardCount === 0) {
      console.log("🌱 Base de dades buida. Executant seed inicial automàtic...");
      const { execSync } = require("child_process");
      execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });
      console.log("✅ Seed completat amb èxit!");
    } else {
      console.log("✅ La base de dades ja té cromos i configuració inicial. No cal fer seed.");
    }

    // Assegurar que els usuaris principals estan configurats
    const adminRole = await prisma.role.findUnique({ where: { name: "admin" } });
    const studentRole = await prisma.role.findUnique({ where: { name: "student" } });

    if (adminRole) {
      await prisma.user.upsert({
        where: { email: "ramon.clemente@lacetania.cat" },
        update: { roleId: adminRole.id, isActive: true },
        create: {
          email: "ramon.clemente@lacetania.cat",
          name: "Ramon Clemente",
          displayName: "Ramon Clemente (Admin)",
          roleId: adminRole.id,
          level: 5,
          xp: 250,
          xpToNextLevel: 500,
          isActive: true,
          stats: {
            create: {
              totalAnswers: 0,
              correctAnswers: 0,
              totalCards: 0,
              uniqueCards: 0,
              pastedCards: 0,
              tradesCompleted: 0,
              streakDays: 1,
              lastActivityDate: new Date(),
            },
          },
        },
      });
    }

    if (studentRole) {
      await prisma.user.upsert({
        where: { email: "jrosanas17@gmail.com" },
        update: { roleId: studentRole.id, isActive: true },
        create: {
          email: "jrosanas17@gmail.com",
          name: "J. Rosanas",
          displayName: "J. Rosanas (Alumne)",
          roleId: studentRole.id,
          level: 1,
          xp: 0,
          xpToNextLevel: 100,
          isActive: true,
          stats: {
            create: {
              totalAnswers: 0,
              correctAnswers: 0,
              totalCards: 0,
              uniqueCards: 0,
              pastedCards: 0,
              tradesCompleted: 0,
              streakDays: 1,
              lastActivityDate: new Date(),
            },
          },
        },
      });
    }
  } catch (error) {
    console.error("Avís durant ensure-db:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
