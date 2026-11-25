import { NextRequest, NextResponse } from "next/server";
import { findOrCreateUser, createSessionToken, setSessionCookie, isAllowedDomain } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, roleName } = body;

    if (!email) {
      return NextResponse.json({ error: "El correu electrònic és obligatori" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Validació estricta del domini al servidor
    if (!isAllowedDomain(normalizedEmail)) {
      return NextResponse.json(
        {
          error: "Domini no autoritzat",
          message: "Només s'admeten usuaris amb compte corporatiu de l'Institut Lacetània (@lacetania.cat)",
        },
        { status: 403 }
      );
    }

    // Determinar avatar inicial segons el nom
    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(normalizedEmail)}`;

    // Crear o trobar l'usuari a la base de dades
    const user = await findOrCreateUser({
      email: normalizedEmail,
      name: name || normalizedEmail.split("@")[0],
      avatar,
      roleName: roleName || "student",
    });

    // Generar sessió
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.displayName || user.name,
      role: user.role.name,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.displayName || user.name,
        role: user.role.name,
        level: user.level,
        points: user.points,
      },
    });
  } catch (err: unknown) {
    console.error("Error a dev-login:", err);
    const errorMessage = err instanceof Error ? err.message : "Error iniciant sessió";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
