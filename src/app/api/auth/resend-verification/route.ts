import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { db } from "@/lib/db"
import { sendEmail } from "@/lib/emails/service"
import { EmailVerificationEmail } from "@/lib/emails/templates"
import { rateLimit } from "@/lib/rate-limit/middleware"

export async function POST(request: NextRequest) {
  try {
    // Rate limiting using centralized system
    const { allowed, response: rateLimitResponse } = await rateLimit(request)
    if (!allowed) {
      return rateLimitResponse
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

    if (!user) {
      // Não revelar se o email existe ou não por segurança
      return NextResponse.json(
        { message: "Se o email estiver cadastrado, você receberá um link de verificação." },
        { status: 200 }
      )
    }

    // Verificar se já está verificado
    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Este email já foi verificado. Você pode fazer login normalmente." },
        { status: 400 }
      )
    }

    // Deletar tokens anteriores do usuário
    await db.verificationToken.deleteMany({
      where: { identifier: email }
    })

    // Gerar novo token
    const verificationToken = crypto.randomUUID()
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

    // Salvar novo token
    await db.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires,
      }
    })

    // Criar URL de verificação
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`

    // Enviar email
    await sendEmail({
      to: email,
      subject: "Verifique seu email - Moodz",
      template: EmailVerificationEmail,
      props: {
        userName: user.name || "Usuário",
        verificationUrl,
      },
      userId: user.id,
      type: "email_verification",
    })

    return NextResponse.json(
      { 
        message: "Email de verificação enviado! Verifique sua caixa de entrada.", 
        success: true,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erro ao reenviar email de verificação:", error)
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
