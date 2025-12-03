import NextAuth from "next-auth"
import authConfig from "@/lib/auth.config"

/**
 * Middleware do Next.js para proteção de rotas
 * 
 * Usa auth.config.ts (configuração leve) em vez de auth.ts
 * porque o middleware roda no Edge Runtime que não suporta Prisma
 * 
 * A lógica de autorização está no callback "authorized" em auth.config.ts
 */
const { auth } = NextAuth(authConfig)

export default auth

export const config = {
  // Matcher para ignorar rotas estáticas e de API
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sw.js|icons|sounds).*)"
  ],
}
