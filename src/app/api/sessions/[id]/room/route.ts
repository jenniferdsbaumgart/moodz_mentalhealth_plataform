import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { createDailyRoom } from "@/lib/daily-server"
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

    // Verificar se sessao existe
    const sessionData = await db.groupSession.findUnique({
      where: { id: params.id },
    })

    if (!sessionData) {
      return NextResponse.json(
        { success: false, message: "Sessão não encontrada" } as ApiResponse,
        { status: 404 }
      )
    }

    // Verificar se usuario e terapeuta da sessao
    const therapistProfile = await db.therapistProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!therapistProfile || therapistProfile.id !== sessionData.therapistId) {
      return NextResponse.json(
        { success: false, message: "Acesso negado. Apenas o terapeuta pode iniciar a sessão" } as ApiResponse,
        { status: 403 }
      )
    }

    // Verificar se sessao esta agendada
    if (sessionData.status !== "SCHEDULED") {
      return NextResponse.json(
        { success: false, message: "Sessão não pode ser iniciada neste status" } as ApiResponse,
        { status: 400 }
      )
    }

    // Verificar se ja existe uma sala
    if (sessionData.roomName) {
      return NextResponse.json(
        { success: false, message: "Sala já foi criada para esta sessão" } as ApiResponse,
        { status: 409 }
      )
    }

    // Criar sala no Daily.co
    const roomData = await createDailyRoom(params.id)

    // Atualizar sessao no banco
    const updatedSession = await db.groupSession.update({
      where: { id: params.id },
      data: {
        roomName: roomData.roomName,
        roomUrl: roomData.roomUrl,
        status: "LIVE",
      },
      include: {
        _count: {
          select: { participants: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        session: updatedSession,
        room: roomData,
      },
      message: "Sala criada e sessão iniciada com sucesso",
    } as ApiResponse)
  } catch (error) {
    console.error("Erro ao criar sala da sessão:", error)
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    )
  }
}

