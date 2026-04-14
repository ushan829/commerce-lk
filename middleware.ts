import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export default withAuth(
  async function middleware(req) {
    const { pathname } = req.nextUrl
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    // Protect /api/admin routes
    if (pathname.startsWith('/api/admin')) {
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      if (token.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      return NextResponse.next()
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        if (path.startsWith("/admin")) {
          return token?.role === "admin"
        }
        if (path.startsWith("/profile")) {
          return !!token
        }
        if (path.startsWith("/api/admin")) {
          return !!token
        }
        return true
      }
    }
  }
)

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*", "/api/admin/:path*"]
}
