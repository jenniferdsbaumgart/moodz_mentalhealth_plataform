import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import authConfig from "@/lib/auth.config"

/**
 * Configuração completa do NextAuth para uso em Server Components e API Routes
 * Inclui PrismaAdapter e providers que requerem acesso ao banco de dados
 * 
 * Para uso no middleware (Edge Runtime), use auth.config.ts diretamente
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email as string
          }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        // Verificar se o email foi verificado
        // Comentado temporariamente para permitir desenvolvimento
        // if (!user.emailVerified) {
        //   throw new Error("EMAIL_NOT_VERIFIED")
        // }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      }
    }),
    // Adicione outros providers aqui (Google, GitHub, etc)
  ],
})

// Re-export authOptions para compatibilidade com código legado
export const authOptions = {
  adapter: PrismaAdapter(db),
  ...authConfig,
}
