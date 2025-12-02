import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { ApiResponse } from "@/types/user"

interface RouteParams {
  params: { id: string }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Verificar autenticacao
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Não autorizado" } as ApiResponse,
        { status: 401 }
      )
    }

    // Verificar se inscricao existe
    const enrollment = await db.sessionParticipant.findUnique({
      where: {
        sessionId_userId: {
          sessionId: params.id,
          userId: session.user.id,
        }
      }
    })

    if (!enrollment) {
      return NextResponse.json(
        { success: false, message: "Você não está inscrito nesta sessão" } as ApiResponse,
        { status: 404 }
      )
    }

    // Verificar se sessao permite cancelamento
    const sessionData = await db.groupSession.findUnique({
      where: { id: params.id },
      select: { status: true, scheduledAt: true }
    })

    if (!sessionData || sessionData.status !== "SCHEDULED") {
      return NextResponse.json(
        { success: false, message: "Não é possível cancelar a inscrição nesta sessão" } as ApiResponse,
        { status: 400 }
      )
    }

    // Verificar se sessao comeca em menos de 24 horas
    const sessionStart = new Date(sessionData.scheduledAt)
    const now = new Date()
    const hoursUntilStart = (sessionStart.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntilStart < 24) {
      return NextResponse.json(
        { success: false, message: "Não é possível cancelar com menos de 24 horas de antecedência" } as ApiResponse,
        { status: 400 }
      )
    }

    // Deletar inscricao
    await db.sessionParticipant.delete({
      where: {
        sessionId_userId: {
          sessionId: params.id,
          userId: session.user.id,
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: "Inscrição cancelada com sucesso",
    } as ApiResponse)
  } catch (error) {
    console.error("Erro ao cancelar inscrição:", error)
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    )
  }
}



