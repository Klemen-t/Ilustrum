import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { cancelTrade } from "@/services/trade.service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "No autoritzat" }, { status: 401 });
  }

  const { id: tradeId } = await params;

  try {
    const updatedTrade = await cancelTrade(tradeId, session.userId);
    return NextResponse.json({ success: true, trade: updatedTrade });
  } catch (error: unknown) {
    console.error("Error cancel·lant intercanvi:", error);
    const msg = error instanceof Error ? error.message : "Error cancel·lant l'intercanvi";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
