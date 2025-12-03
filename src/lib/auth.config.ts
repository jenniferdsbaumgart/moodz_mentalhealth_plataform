import type { NextAuthConfig } from "next-auth"

/**
 * Configuração leve do NextAuth para uso no Edge Runtime (middleware)
 * NÃO deve importar db, PrismaAdapter, ou qualquer coisa que use Node.js APIs
 * 
 * A lógica completa de autenticação (providers, adapter) está em auth.ts
 */
export default {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    signUp: "/register",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user
      const isAuthRoute = 
        request.nextUrl.pathname.startsWith("/login") ||
        request.nextUrl.pathname.startsWith("/register") ||
        request.nextUrl.pathname.startsWith("/onboarding") ||
        request.nextUrl.pathname.startsWith("/verify-email") ||
        request.nextUrl.pathname.startsWith("/forgot-password") ||
        request.nextUrl.pathname.startsWith("/reset-password")
      const isPublicRoute = 
        request.nextUrl.pathname === "/" ||
        request.nextUrl.pathname.startsWith("/blog") ||
        request.nextUrl.pathname.startsWith("/therapists")
      const isApiRoute = request.nextUrl.pathname.startsWith("/api")

      // API routes são tratadas pelos próprios handlers
      if (isApiRoute) {
        return true
      }

      // Rotas de auth - redirecionar se já logado
      if (isAuthRoute) {
        if (isLoggedIn) {
          // Redirecionar para dashboard baseado no role
          const role = auth?.user?.role
          switch (role) {
            case "THERAPIST":
              return Response.redirect(new URL("/therapist/dashboard", request.nextUrl))
            case "ADMIN":
              return Response.redirect(new URL("/admin/dashboard", request.nextUrl))
            case "SUPER_ADMIN":
              return Response.redirect(new URL("/super-admin/dashboard", request.nextUrl))
            default:
              return Response.redirect(new URL("/dashboard", request.nextUrl))
          }
        }
        return true
      }

      // Rotas públicas - permitir acesso
      if (isPublicRoute) {
        return true
      }

      // Outras rotas - requerem login
      return isLoggedIn
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    }
  },
  // Providers serão adicionados em auth.ts (requer acesso ao db)
  providers: []
} satisfies NextAuthConfig
