import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  async function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Protect /api/admin routes specifically to return JSON instead of redirecting
    if (pathname.startsWith('/api/admin')) {
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      if (token.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        
        // Admin paths require admin role
        if (path.startsWith("/admin") || path.startsWith("/api/admin")) {
          return token?.role === "admin"
        }
        
        // Profile paths require any logged in user
        if (path.startsWith("/profile")) {
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
