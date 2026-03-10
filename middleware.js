import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth(function middleware(req) {
  const { pathname } = req.nextUrl
  const session      = req.auth

  // Logged in + visiting auth pages → go to chat
  if (
    session &&
    (pathname === '/' ||
     pathname === '/login' ||
     pathname === '/register')
  ) {
    return NextResponse.redirect(new URL('/chat', req.url))
  }

  // Not logged in + visiting protected pages → go to login
  const protectedPaths = ['/chat', '/image', '/video', '/analyze', '/settings']
  if (!session && protectedPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
}