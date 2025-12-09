import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { db } from "@/lib/db"
import { sendEmail } from "@/lib/emails/service"
import { PasswordResetEmail } from "@/lib/emails/templates"
import { rateLimit } from "@/lib/rate-limit/middleware"

export async function POST(request: NextRequest) {
  try {
    // Rate limiting using centralized system
    const { allowed, response: rateLimitResponse } = await rateLimit(request)
    if (!allowed && rateLimitResponse) {
      return rateLimitResponse
    } else if (!allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { message: "Email é obrigatório" },
        { status: 400 }
      )
    }

    // Buscar usuário
    const user = await db.user.findUnique({
      where: { email }
    })

    // Por segurança, sempre retornar a mesma mensagem
    // independente se o email existe ou não
    const successMessage = "Se o email estiver cadastrado, você receberá um link para redefinir sua senha."

    if (!user) {
      return NextResponse.json(
        { message: successMessage, success: true },
        { status: 200 }
      )
    }

    // Deletar tokens anteriores de reset do usuário
    await db.verificationToken.deleteMany({
      where: {
        identifier: `reset:${email}`
      }
    })

    // Gerar novo token
    const resetToken = crypto.randomUUID()
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    // Salvar token (usando prefixo "reset:" para diferenciar de verificação de email)
    await db.verificationToken.create({
      data: {
        identifier: `reset:${email}`,
        token: resetToken,
        expires,
      }
    })

    // Criar URL de reset
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`

    // Enviar email
    await sendEmail({
      to: email,
      subject: "Redefinição de Senha - Moodz",
      template: PasswordResetEmail,
      props: {
        userName: user.name || "Usuário",
        resetUrl,
        expiresIn: "1 hora",
      },
      userId: user.id,
      type: "password_reset",
    })

    return NextResponse.json(
      { message: successMessage, success: true },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erro ao solicitar reset de senha:", error)
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
