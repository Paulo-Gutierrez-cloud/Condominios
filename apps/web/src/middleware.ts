import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { canAccessRoute } from './lib/permissions'
import { Role } from '@condominios/database'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    if (pathname.startsWith('/dashboard')) {
      const userRole = token?.role as Role
      if (!userRole || !canAccessRoute(userRole, pathname)) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        if (pathname.startsWith('/api/auth')) {
          return true
        }

        if (pathname.startsWith('/dashboard')) {
          return !!token
        }

        return true
      },
    },
    pages: {
      signIn: '/auth/login',
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
}
