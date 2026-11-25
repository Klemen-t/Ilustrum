import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const { roleId, isActive } = body;

    // Protecció estricta: només ramon.clemente@lacetania.cat pot tenir rol d'administrador
    if (roleId !== undefined) {
      const targetUser = await prisma.user.findUnique({ where: { id } });
      const adminRole = await prisma.role.findUnique({ where: { name: "admin" } });
      if (
        adminRole &&
        Number(roleId) === adminRole.id &&
        targetUser?.email.toLowerCase() !== "ramon.clemente@lacetania.cat"
      ) {
        return NextResponse.json(
          { error: "Accés denegat: Només l'usuari ramon.clemente@lacetania.cat pot tenir el rol d'administrador." },
          { status: 403 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        roleId: roleId !== undefined ? Number(roleId) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
      include: { role: true },
    });

    await prisma.activityLog.create({
      data: {
        userId: admin.id,
        action: "ADMIN_UPDATE_USER",
        entity: "user",
        entityId: id,
        metadata: JSON.stringify(body),
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error actualitzant usuari";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
