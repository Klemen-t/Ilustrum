import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPeersDuplicates } from "@/services/trade.service";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "No autoritzat" }, { status: 401 });
  }

  try {
    const peers = await getPeersDuplicates(session.userId);
    return NextResponse.json({ peers });
  } catch (error: unknown) {
    console.error("Error obtenint companys amb repetits:", error);
    return NextResponse.json({ error: "Error obtenint els companys." }, { status: 500 });
  }
}
