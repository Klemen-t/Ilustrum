import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

interface ParsedQuestion {
  statement: string;
  answers: { text: string; isCorrect: boolean }[];
  explanation: string;
  moduleName?: string;
}

/**
 * Parser intel·ligent i flexible de preguntes en format de text senzill.
 * Exemple:
 * PREGUNTA: Quina comanda mostra les adreces IP a Linux?
 * A) ip addr
 * B) ifconfig /all
 * C) route -n
 * D) ping 127.0.0.1
 * CORRECTA: A
 * MÒDUL: SMIX M02
 * EXPLICACIÓ: La comanda 'ip addr' és l'estàndard actual a Linux.
 */
function parseTextQuestions(text: string): ParsedQuestion[] {
  const blocks = text.split(/\n\s*(?:---+|===+|PREGUNTA:?|\d+[\.\)]\s*PREGUNTA:?)/i);
  const questions: ParsedQuestion[] = [];

  for (const rawBlock of blocks) {
    const trimmed = rawBlock.trim();
    if (!trimmed) continue;

    const lines = trimmed.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 5) continue;

    let statement = "";
    const options: { letter: string; text: string }[] = [];
    let correctLetter = "";
    let explanation = "";
    let moduleName = "";

    for (const line of lines) {
      if (!statement && !line.match(/^[A-D]\)/i)) {
        statement = line.replace(/^(?:PREGUNTA:?|\d+[\.\)]\s*)/i, "").trim();
        continue;
      }

      const optionMatch = line.match(/^([A-D])\)\s*(.+)$/i);
      if (optionMatch) {
        options.push({
          letter: optionMatch[1].toUpperCase(),
          text: optionMatch[2].trim(),
        });
        continue;
      }

      const correctMatch = line.match(/^(?:CORRECTA|RESPOSTA CORRECTA|RESPOSTA):\s*([A-D])/i);
      if (correctMatch) {
        correctLetter = correctMatch[1].toUpperCase();
        continue;
      }

      const explMatch = line.match(/^(?:EXPLICACI[OÓ]|JUSTIFICACI[OÓ]):\s*(.+)$/i);
      if (explMatch) {
        explanation = explMatch[1].trim();
        continue;
      }

      const modMatch = line.match(/^(?:M[OÒ]DUL|ASSIGNATURA|CURS):\s*(.+)$/i);
      if (modMatch) {
        moduleName = modMatch[1].trim();
        continue;
      }
    }

    if (statement && options.length === 4 && correctLetter) {
      questions.push({
        statement,
        explanation: explanation || "Resposta correcta comprovada.",
        moduleName: moduleName || undefined,
        answers: options.map((opt) => ({
          text: opt.text,
          isCorrect: opt.letter === correctLetter,
        })),
      });
    }
  }

  return questions;
}

/**
 * Parser per a format CSV senzill (Pregunta;A;B;C;D;Correcta;Mòdul;Explicació)
 */
function parseCsvQuestions(csvText: string): ParsedQuestion[] {
  const lines = csvText.split("\n").map((l) => l.trim()).filter(Boolean);
  const questions: ParsedQuestion[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Ometre capçalera
    if (i === 0 && (line.toLowerCase().includes("pregunta") || line.toLowerCase().includes("enunciat"))) {
      continue;
    }

    const separator = line.includes(";") ? ";" : ",";
    const parts = line.split(separator).map((p) => p.trim());

    if (parts.length >= 6) {
      const statement = parts[0];
      const optA = parts[1];
      const optB = parts[2];
      const optC = parts[3];
      const optD = parts[4];
      const correctLetter = parts[5].toUpperCase().trim();
      const moduleName = parts[6] || "";
      const explanation = parts[7] || "Resposta correcta comprovada.";

      if (statement && optA && optB && optC && optD && ["A", "B", "C", "D"].includes(correctLetter)) {
        questions.push({
          statement,
          explanation,
          moduleName: moduleName || undefined,
          answers: [
            { text: optA, isCorrect: correctLetter === "A" },
            { text: optB, isCorrect: correctLetter === "B" },
            { text: optC, isCorrect: correctLetter === "C" },
            { text: optD, isCorrect: correctLetter === "D" },
          ],
        });
      }
    }
  }

  return questions;
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Accés no autoritzat";
    return NextResponse.json({ error: msg }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { content, format = "text", dryRun = false } = body;

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json({ error: "El contingut de les preguntes és obligatori." }, { status: 400 });
    }

    // 1. Processar preguntes segons el format
    const parsedQuestions =
      format === "csv" ? parseCsvQuestions(content) : parseTextQuestions(content);

    if (parsedQuestions.length === 0) {
      return NextResponse.json(
        {
          error:
            "No s'ha detectat cap pregunta vàlida. Assegura't de seguir el format (Enunciat + 4 opcions A/B/C/D + Resposta correcta).",
        },
        { status: 400 }
      );
    }

    // 2. Si és dryRun, només retornem la previsualització
    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        detectedCount: parsedQuestions.length,
        preview: parsedQuestions.slice(0, 5),
      });
    }

    // 3. Obtenir mòdul i categoria per defecte per associar
    const defaultSubject = await prisma.subject.findFirst({
      where: { slug: { contains: "m05" } },
    }) || await prisma.subject.findFirst();

    const defaultCategory = await prisma.category.findFirst({
      where: { slug: "xarxes" },
    }) || await prisma.category.findFirst();

    if (!defaultSubject || !defaultCategory) {
      return NextResponse.json(
        { error: "No s'ha trobat cap assignatura o categoria al sistema per associar les preguntes." },
        { status: 500 }
      );
    }

    // 4. Guardar preguntes a la base de dades
    let imported = 0;
    for (const q of parsedQuestions) {
      let subjectId = defaultSubject.id;
      if (q.moduleName) {
        const foundSubject = await prisma.subject.findFirst({
          where: {
            OR: [
              { slug: { contains: q.moduleName.toLowerCase(), mode: "insensitive" } },
              { name: { contains: q.moduleName, mode: "insensitive" } },
            ],
          },
        });
        if (foundSubject) subjectId = foundSubject.id;
      }

      const createdQuestion = await prisma.question.create({
        data: {
          statement: q.statement,
          difficulty: "medium",
          points: 10,
          xpReward: 15,
          recommendedTime: 20,
          explanation: q.explanation,
          subjectId,
          categoryId: defaultCategory.id,
          isActive: true,
          answers: {
            create: q.answers.map((a, idx) => ({
              text: a.text,
              isCorrect: a.isCorrect,
              sortOrder: idx + 1,
            })),
          },
        },
      });

      imported++;
    }

    return NextResponse.json({
      success: true,
      importedCount: imported,
      message: `S'han importat correctament ${imported} preguntes noves al sistema!`,
    });
  } catch (error: unknown) {
    console.error("Error important preguntes:", error);
    const msg = error instanceof Error ? error.message : "Error processant la importació";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
