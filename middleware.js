import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn   = !!req.auth

  // ── Public routes — always allow ──────────────
  const publicPaths = [
    '/',
    '/login',
    '/register',
    '/api/auth',
  ]

  const isPublic = publicPaths.some((p) =>
    pathname === p || pathname.startsWith(p)
  )

  if (isPublic) return NextResponse.next()

  // ── API routes — return 401 if not logged in ──
  if (pathname.startsWith('/api/')) {
    if (!isLoggedIn) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    return NextResponse.next()
  }

  // ── Protected pages — redirect to login ───────
  if (!isLoggedIn) {
    const loginUrl = new URL('/login', req.nextUrl.origin)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - _next/static
     * - _next/image
     * - favicon.ico
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}