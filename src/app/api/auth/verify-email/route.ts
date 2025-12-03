import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json(
        { message: "Token de verificação não fornecido" },
        { status: 400 }
      )
    }

    // Buscar token no banco
    const verificationToken = await db.verificationToken.findUnique({
      where: { token }
    })

    if (!verificationToken) {
      return NextResponse.json(
        { message: "Token de verificação inválido ou já utilizado" },
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
        { message: "Token de verificação expirado. Solicite um novo email de verificação.", expired: true },
        { status: 400 }
      )
    }

    // Buscar usuário pelo email (identifier)
    const user = await db.user.findUnique({
      where: { email: verificationToken.identifier }
    })

    if (!user) {
      return NextResponse.json(
        { message: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    // Verificar se já foi verificado
    if (user.emailVerified) {
      // Deletar token se ainda existir
      await db.verificationToken.delete({
        where: { token }
      })

      return NextResponse.json(
        { message: "Email já foi verificado anteriormente", alreadyVerified: true },
        { status: 200 }
      )
    }

    // Atualizar usuário como verificado
    await db.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() }
    })

    // Deletar token usado
    await db.verificationToken.delete({
      where: { token }
    })

    return NextResponse.json(
      { message: "Email verificado com sucesso! Você já pode fazer login.", success: true },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erro ao verificar email:", error)
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

