import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      orderBy: { captured_at: 'desc' },
    });
    return NextResponse.json(locations);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { linkId, lat, lng, accuracy, coords, userAgent } = await request.json();
    await prisma.location.create({
      data: {
        link_id: linkId,
        lat,
        lng,
        accuracy,
        coords,
        user_agent: userAgent,
      },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}