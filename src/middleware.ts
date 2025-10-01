import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Route protette che richiedono autenticazione
  const protectedRoutes = ['/profile', '/reviews', '/watchlist', '/lists']
  const isProtectedRoute = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  )

  // Reindirizza a /auth se non autenticato e sta cercando di accedere a una route protetta
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  // Reindirizza alla home se autenticato e sta cercando di accedere a /auth
  if (req.nextUrl.pathname === '/auth' && session) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

export const config = {
  matcher: ['/auth', '/profile/:path*', '/reviews/:path*', '/watchlist/:path*', '/lists/:path*'],
}
