import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { createMeetingToken } from "@/lib/daily-server"
import { ApiResponse } from "@/types/user"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Verificar autenticacao
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Não autorizado" } as ApiResponse,
        { status: 401 }
      )
    }

    const { id } = await params

    // Verificar se sessao existe e esta ativa
    const sessionData = await db.groupSession.findUnique({
      where: { id },
    })

    if (!sessionData) {
      return NextResponse.json(
        { success: false, message: "Sessão não encontrada" } as ApiResponse,
        { status: 404 }
      )
    }

    if (sessionData.status !== "LIVE") {
      return NextResponse.json(
        { success: false, message: "Sessão não está ativa" } as ApiResponse,
        { status: 400 }
      )
    }

    if (!sessionData.roomName) {
      return NextResponse.json(
        { success: false, message: "Sala não foi criada para esta sessão" } as ApiResponse,
        { status: 400 }
      )
    }

    // Verificar se usuario esta inscrito ou e terapeuta
    const therapistProfile = await db.therapistProfile.findUnique({
      where: { userId: session.user.id },
    })

    const isTherapist = therapistProfile?.id === sessionData.therapistId

    let isParticipant = false
    if (!isTherapist) {
      // Verificar se usuario e paciente inscrito
      const patientProfile = await db.patientProfile.findUnique({
        where: { userId: session.user.id },
      })

      if (!patientProfile) {
        return NextResponse.json(
          { success: false, message: "Acesso negado. Apenas participantes podem acessar a sala" } as ApiResponse,
          { status: 403 }
        )
      }

      // Verificar inscricao
      const enrollment = await db.sessionParticipant.findUnique({
        where: {
          sessionId_userId: {
            sessionId: id,
            userId: session.user.id,
          }
        }
      })

      if (!enrollment) {
        return NextResponse.json(
          { success: false, message: "Você não está inscrito nesta sessão" } as ApiResponse,
          { status: 403 }
        )
      }

      isParticipant = true
    }

    // Gerar token de acesso
    const token = await createMeetingToken(
      sessionData.roomName,
      session.user.id,
      session.user.name || "Usuário",
      isTherapist
    )

    return NextResponse.json({
      success: true,
      data: {
        token,
        roomUrl: sessionData.roomUrl,
        isTherapist,
        sessionTitle: sessionData.title,
      },
      message: "Token gerado com sucesso",
    } as ApiResponse)
  } catch (error) {
    console.error("Erro ao gerar token da sessão:", error)
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    )
  }
}

