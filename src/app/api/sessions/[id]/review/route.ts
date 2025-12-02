import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db as prisma } from "@/lib/db"
import { z } from "zod"

// Mock storage para reviews (em produção, seria uma tabela Review)
let mockReviews: Array<{
  id: string
  sessionId: string
  patientId: string
  therapistId: string
  rating: number
  comment?: string
  isAnonymous: boolean
  createdAt: Date
}> = []

const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  isAnonymous: z.boolean().default(false),
})

// GET - Verificar se usuário já avaliou a sessão
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

    // Verificar se a sessão existe e foi concluída
    const groupSession = await prisma.groupSession.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        therapistId: true,
      },
    })

    if (!groupSession) {
      return NextResponse.json(
        { success: false, message: "Sessão não encontrada" },
        { status: 404 }
      )
    }

    if (groupSession.status !== "COMPLETED") {
      return NextResponse.json(
        { success: false, message: "Sessão ainda não foi concluída" },
        { status: 400 }
      )
    }

    // Verificar se usuário participou da sessão
    const participation = await prisma.sessionParticipant.findFirst({
      where: {
        sessionId: id,
        userId: session.user.id,
      },
    })

    if (!participation) {
      return NextResponse.json(
        { success: false, message: "Você não participou desta sessão" },
        { status: 403 }
      )
    }

    // Verificar se já existe uma avaliação (mock)
    const existingReview = mockReviews.find(
      review => review.sessionId === id && review.patientId === session.user.id
    )

    return NextResponse.json({
      success: true,
      data: {
        hasReviewed: !!existingReview,
        canReview: groupSession.status === "COMPLETED",
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

// POST - Criar avaliação da sessão
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userSession = await getServerSession(authOptions)

    if (!userSession?.user) {
      return NextResponse.json(
        { success: false, message: "Não autenticado" },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await request.json()
    const validatedData = createReviewSchema.parse(body)

    // Verificar se a sessão existe e foi concluída
    const groupSession = await prisma.groupSession.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        therapistId: true,
        title: true,
      },
    })

    if (!groupSession) {
      return NextResponse.json(
        { success: false, message: "Sessão não encontrada" },
        { status: 404 }
      )
    }

    if (groupSession.status !== "COMPLETED") {
      return NextResponse.json(
        { success: false, message: "Sessão ainda não foi concluída" },
        { status: 400 }
      )
    }

    // Verificar se usuário participou da sessão
    const participation = await prisma.sessionParticipant.findFirst({
      where: {
        sessionId: id,
        userId: userSession.user.id,
      },
    })

    if (!participation) {
      return NextResponse.json(
        { success: false, message: "Você não participou desta sessão" },
        { status: 403 }
      )
    }

    // Verificar se já existe uma avaliação
    const existingReview = mockReviews.find(
      review => review.sessionId === id && review.patientId === userSession.user.id
    )

    if (existingReview) {
      return NextResponse.json(
        { success: false, message: "Você já avaliou esta sessão" },
        { status: 409 }
      )
    }

    // Criar avaliação (mock)
    const newReview = {
      id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sessionId: id,
      patientId: userSession.user.id,
      therapistId: groupSession.therapistId,
      rating: validatedData.rating,
      comment: validatedData.comment,
      isAnonymous: validatedData.isAnonymous,
      createdAt: new Date(),
    }

    mockReviews.push(newReview)

    return NextResponse.json({
      success: true,
      data: newReview,
      message: "Avaliação enviada com sucesso",
    }, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar avaliação:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Dados inválidos",
          errors: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

