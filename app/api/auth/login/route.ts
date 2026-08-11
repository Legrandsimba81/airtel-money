import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PASSWORD = 'AdminSimba1234$';

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  if (password === ADMIN_PASSWORD) {
    const response = NextResponse.json({ success: true });
    response.cookies.set('auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24,
      path: '/',
    });
    return response;
  }
  return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 });
}