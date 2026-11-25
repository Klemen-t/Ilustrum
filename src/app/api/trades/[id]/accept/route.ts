import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { acceptMarketListing, acceptTrade } from "@/services/trade.service";

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
    let cardIdToGive: string | undefined;
    try {
      const body = await request.json();
      cardIdToGive = body.cardIdToGive;
    } catch {
      // Body buit
    }

    let updatedTrade;
    if (cardIdToGive) {
      updatedTrade = await acceptMarketListing(tradeId, session.userId, cardIdToGive);
    } else {
      updatedTrade = await acceptTrade(tradeId, session.userId);
    }

    return NextResponse.json({ success: true, trade: updatedTrade });
  } catch (error: unknown) {
    console.error("Error acceptant intercanvi:", error);
    const msg = error instanceof Error ? error.message : "Error acceptant l'intercanvi";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
