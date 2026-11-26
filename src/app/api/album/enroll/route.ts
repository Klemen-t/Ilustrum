import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { toggleAlbumEnrollment, getUserEnrolledAlbumIds } from "@/services/album.service";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autoritzat" }, { status: 401 });
  }

  try {
    const enrolledIds = await getUserEnrolledAlbumIds(session.userId);
    return NextResponse.json({ enrolledAlbumIds: enrolledIds });
  } catch (error) {
    console.error("Error obtenint inscripcions d'àlbums:", error);
    return NextResponse.json({ error: "Error intern obtenint inscripcions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autoritzat" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { albumId, enroll } = body;

    if (!albumId) {
      return NextResponse.json({ error: "El camp 'albumId' és obligatori." }, { status: 400 });
    }

    const result = await toggleAlbumEnrollment(session.userId, albumId, enroll);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error commutant inscripció d'àlbum:", error);
    return NextResponse.json({ error: "Error processant la inscripció" }, { status: 500 });
  }
}
