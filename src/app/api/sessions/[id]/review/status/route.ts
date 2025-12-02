import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db as prisma } from "@/lib/db"

// GET - Verificar status da avaliação do usuário para uma sessão
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Não autenticado" },
        { status: 401 }
      )
    }

    const { id } = params

    // Importar mock storage (em produção seria do banco)
    const { mockReviews } = require("../route")

    // Verificar se já existe uma avaliação
    const existingReview = mockReviews.find(
      (review: any) => review.sessionId === id && review.patientId === session.user.id
    )

    return NextResponse.json({
      success: true,
      data: {
        hasReviewed: !!existingReview,
        review: existingReview || null,
      },
    })
  } catch (error) {
    console.error("Erro ao verificar status da avaliação:", error)
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

