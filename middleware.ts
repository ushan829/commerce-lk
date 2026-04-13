import { withAuth } from "next-auth/middleware"

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const path = req.nextUrl.pathname
      if (path.startsWith("/admin")) {
        return token?.role === "admin"
      }
      if (path.startsWith("/profile")) {
        return !!token
      }
      return true
    }
  }
})

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*"]
}
