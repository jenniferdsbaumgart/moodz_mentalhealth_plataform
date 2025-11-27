import { auth } from "@/lib/auth"
import { Role } from "@prisma/client"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthRoute = req.nextUrl.pathname.startsWith("/login") ||
                      req.nextUrl.pathname.startsWith("/register") ||
                      req.nextUrl.pathname.startsWith("/onboarding")
  const isPublicRoute = req.nextUrl.pathname === "/"

  if (isAuthRoute && isLoggedIn) {
    // Redirect based on role
    const userRole = req.auth.user?.role as Role

    switch (userRole) {
      case Role.PATIENT:
        return Response.redirect(new URL("/dashboard", req.nextUrl))
      case Role.THERAPIST:
        return Response.redirect(new URL("/therapist/dashboard", req.nextUrl))
      case Role.ADMIN:
        return Response.redirect(new URL("/admin/dashboard", req.nextUrl))
      case Role.SUPER_ADMIN:
        return Response.redirect(new URL("/super-admin/dashboard", req.nextUrl))
      default:
        return Response.redirect(new URL("/dashboard", req.nextUrl))
    }
  }

  if (!isLoggedIn && !isAuthRoute && !isPublicRoute) {
    return Response.redirect(new URL("/login", req.nextUrl))
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
