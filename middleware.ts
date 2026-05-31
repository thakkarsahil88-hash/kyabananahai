import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const isAuth = !!token
  const path = req.nextUrl.pathname

  const protectedPaths = ['/cook', '/recipes', '/recipe', '/history', '/settings', '/onboarding']
  const isProtected = protectedPaths.some(p => path.startsWith(p))

  if (isProtected && !isAuth) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/cook/:path*',
    '/recipes/:path*',
    '/recipe/:path*',
    '/history/:path*',
    '/settings/:path*',
    '/onboarding/:path*',
  ],
}
