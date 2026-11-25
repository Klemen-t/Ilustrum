import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { submitAnswer } from "@/services/question.service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "No autoritzat" }, { status: 401 });
  }

  const { id: questionId } = await params;

  try {
    const body = await request.json();
    const { answerId, secondsUsed } = body;

    if (!answerId) {
      return NextResponse.json(
        { error: "L'identificador de resposta (answerId) és obligatori." },
        { status: 400 }
      );
    }

    const parsedSeconds = typeof secondsUsed === "number" ? secondsUsed : 10;
    const result = await submitAnswer(session.userId, questionId, answerId, parsedSeconds);

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Error avaluant resposta:", error);
    const msg = error instanceof Error ? error.message : "Error processant la resposta";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
