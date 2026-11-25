import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await requireAdmin();

    const [configs, rarities] = await Promise.all([
      prisma.appConfig.findMany({ orderBy: { key: "asc" } }),
      prisma.rarity.findMany({ orderBy: { sortOrder: "asc" } }),
    ]);

    return NextResponse.json({ configs, rarities });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Accés no autoritzat";
    return NextResponse.json({ error: msg }, { status: 403 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: "Clau i valor requerits" }, { status: 400 });
    }

    const config = await prisma.appConfig.upsert({
      where: { key },
      update: { value: String(value), updatedBy: admin.id },
      create: { key, value: String(value), updatedBy: admin.id },
    });

    await prisma.activityLog.create({
      data: {
        userId: admin.id,
        action: "ADMIN_UPDATE_CONFIG",
        entity: "config",
        entityId: key,
        metadata: JSON.stringify({ key, value }),
      },
    });

    return NextResponse.json({ success: true, config });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error desant configuració";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
