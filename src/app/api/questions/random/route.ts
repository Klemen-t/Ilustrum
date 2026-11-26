import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getRandomQuestion, getUserDailyQuestionStatus } from "@/services/question.service";
import { getUserEnrolledAlbumIds } from "@/services/album.service";

export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "No autoritzat" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const requestedAlbumId = searchParams.get("albumId") || undefined;

  try {
    const [dailyStatus, enrolledAlbumIds] = await Promise.all([
      getUserDailyQuestionStatus(session.userId),
      getUserEnrolledAlbumIds(session.userId),
    ]);

    // Comprovar si l'usuari no participa en cap àlbum
    if (enrolledAlbumIds.length === 0 && !requestedAlbumId) {
      return NextResponse.json({
        question: null,
        noEnrollments: true,
        message: "No estàs participant en cap àlbum. Activa la teva participació en almenys un àlbum per rebre preguntes!",
        dailyStatus,
        enrolledAlbumIds: [],
      });
    }

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

    const question = await getRandomQuestion(session.userId, requestedAlbumId);

    if (!question) {
      return NextResponse.json(
        {
          question: null,
          error: "No hi ha preguntes disponibles per als teus àlbums seleccionats.",
          enrolledAlbumIds,
          dailyStatus,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ question, dailyStatus, enrolledAlbumIds });
  } catch (error: unknown) {
    console.error("Error obtenint pregunta aleatòria:", error);
    return NextResponse.json(
      { error: "Error intern obtenint la pregunta." },
      { status: 500 }
    );
  }
}
