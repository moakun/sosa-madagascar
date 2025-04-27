import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email utilisateur requis' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
      select: {
        video1: true,
        video2: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const videoStatus = {
      video1Status: user.video1 ? 'Regardé' : 'Non Regardé',
      video2Status: user.video2 ? 'Regardé' : 'Non Regardé',
    };

    return NextResponse.json(
      { success: true, videoStatus },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la récupération du statut vidéo:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const { email, video1, video2 } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email utilisateur requis' },
        { status: 400 }
      );
    }

    await db.user.update({
      where: { email },
      data: {
        video1: video1 !== undefined ? video1 : undefined,
        video2: video2 !== undefined ? video2 : undefined,
      },
    });

    return NextResponse.json(
      { success: true, message: 'Statut vidéo mis à jour avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut vidéo:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}