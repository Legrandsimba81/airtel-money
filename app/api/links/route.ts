import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const links = await prisma.link.findMany({
      orderBy: { created_at: 'desc' },
    });
    return NextResponse.json(links);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    const id = 'link_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    const link = await prisma.link.create({
      data: { id, name: name || 'Sans nom' },
    });
    return NextResponse.json(link);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}