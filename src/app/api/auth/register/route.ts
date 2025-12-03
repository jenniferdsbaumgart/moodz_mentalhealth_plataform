import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { db } from "@/lib/db"
import { sendEmail } from "@/lib/emails/service"
import { EmailVerificationEmail } from "@/lib/emails/templates"
import { rateLimit } from "@/lib/rate-limit/middleware"

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const { allowed, response: rateLimitResponse } = await rateLimit(request)
    if (!allowed) {
      return rateLimitResponse
    }
    const { name, email, password } = await request.json()

    // Verificar se o usuário já existe
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "Usuário já existe com este email" },
        { status: 400 }
      )
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12)

    // Criar usuário (sem emailVerified)
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      }
    })

    // Gerar token de verificação
    const verificationToken = crypto.randomUUID()
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

    // Salvar token no banco
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

    // Enviar email de verificação
    await sendEmail({
      to: email,
      subject: "Verifique seu email - Moodz",
      template: EmailVerificationEmail,
      props: {
        userName: name || "Usuário",
        verificationUrl,
      },
      userId: user.id,
      type: "email_verification",
    })

    // Remover senha do response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { 
        message: "Conta criada com sucesso! Verifique seu email para ativar sua conta.", 
        user: userWithoutPassword,
        requiresVerification: true,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Erro ao criar usuário:", error)
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}



