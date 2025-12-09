import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db as prisma } from "@/lib/db"
// GET - Verificar status da avaliação do usuário para uma sessão
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Não autenticado" },
        { status: 401 }
      )
    }
    const { id } = await params
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
