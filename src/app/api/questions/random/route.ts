import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getRandomQuestion, getUserDailyQuestionStatus } from "@/services/question.service";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "No autoritzat" }, { status: 401 });
  }

  try {
    const dailyStatus = await getUserDailyQuestionStatus(session.userId);

    // Si ha assolit el límit diari i no és il·limitat
    if (!dailyStatus.canAnswer) {
      return NextResponse.json(
        {
          dailyLimitReached: true,
          dailyStatus,
          message: `Has assolit el límit de ${dailyStatus.dailyLimit} preguntes diàries per avui. Torna demà per continuar col·leccionant cromos!`,
        },
        { status: 429 }
      );
    }

    const question = await getRandomQuestion(session.userId);

    if (!question) {
      return NextResponse.json(
        { error: "No hi ha preguntes disponibles actualment." },
        { status: 404 }
      );
    }

    return NextResponse.json({ question, dailyStatus });
  } catch (error: unknown) {
    console.error("Error obtenint pregunta aleatòria:", error);
    return NextResponse.json(
      { error: "Error intern obtenint la pregunta." },
      { status: 500 }
    );
  }
}
