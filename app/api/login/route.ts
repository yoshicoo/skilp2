import { NextResponse } from 'next/server'
export async function POST(request: Request) {
  const { id, password } = await request.json()
  const AUTH_ID = process.env.AUTH_ID || 'test@shiftinc.jp'
  const AUTH_PASSWORD = process.env.AUTH_PASSWORD || 'p@ssword'
  if (id === AUTH_ID && password === AUTH_PASSWORD) {
    const res = NextResponse.json({ ok: true })
    res.cookies.set('skilp_auth', 'ok', { httpOnly: true, secure: true, path: '/', sameSite: 'lax', maxAge: 60*60*6 })
    return res
  }
  return NextResponse.json({ error: 'IDまたはパスワードが違います' }, { status: 401 })
}
