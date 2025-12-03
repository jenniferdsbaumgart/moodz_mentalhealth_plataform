import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { rateLimit } from "@/lib/rate-limit/middleware"

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const { allowed, response: rateLimitResponse } = await rateLimit(request)
    if (!allowed) {
      return rateLimitResponse
    }

    const { token, password } = await request.json()

    if (!token) {
      return NextResponse.json(
        { message: "Token é obrigatório" },
        { status: 400 }
      )
    }

    if (!password) {
      return NextResponse.json(
        { message: "Nova senha é obrigatória" },
        { status: 400 }
      )
    }

    // Validar complexidade da senha
    if (password.length < 6) {
      return NextResponse.json(
        { message: "A senha deve ter no mínimo 6 caracteres" },
        { status: 400 }
      )
    }

    // Buscar token no banco
    const verificationToken = await db.verificationToken.findUnique({
      where: { token }
    })

    if (!verificationToken) {
      return NextResponse.json(
        { message: "Token inválido ou já utilizado" },
        { status: 400 }
      )
    }

    // Verificar se é um token de reset (começa com "reset:")
    if (!verificationToken.identifier.startsWith("reset:")) {
      return NextResponse.json(
        { message: "Token inválido" },
        { status: 400 }
      )
    }

    // Verificar se o token expirou
    if (new Date() > verificationToken.expires) {
      // Deletar token expirado
      await db.verificationToken.delete({
        where: { token }
      })

      return NextResponse.json(
        { message: "Token expirado. Solicite um novo link de redefinição.", expired: true },
        { status: 400 }
      )
    }

    // Extrair email do identifier (remove o prefixo "reset:")
    const email = verificationToken.identifier.replace("reset:", "")

    // Buscar usuário
    const user = await db.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { message: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(password, 12)

    // Atualizar senha do usuário
    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })

    // Deletar token usado
    await db.verificationToken.delete({
      where: { token }
    })

    // Deletar outros tokens de reset do mesmo usuário (se houver)
    await db.verificationToken.deleteMany({
      where: { identifier: `reset:${email}` }
    })

    return NextResponse.json(
      { message: "Senha redefinida com sucesso! Você já pode fazer login.", success: true },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erro ao redefinir senha:", error)
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

