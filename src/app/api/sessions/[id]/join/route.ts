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

    // Verificar se sessao existe e status SCHEDULED
    const sessionData = await db.groupSession.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { participants: true }
        }
      }
    })

    if (!sessionData) {
      return NextResponse.json(
        { success: false, message: "Sessão não encontrada" } as ApiResponse,
        { status: 404 }
      )
    }

    if (sessionData.status !== "SCHEDULED") {
      return NextResponse.json(
        { success: false, message: "Não é possível se inscrever nesta sessão" } as ApiResponse,
        { status: 400 }
      )
    }

    // Verificar limite de participantes
    if (sessionData._count.participants >= sessionData.maxParticipants) {
      return NextResponse.json(
        { success: false, message: "Sessão está lotada" } as ApiResponse,
        { status: 400 }
      )
    }

    // Verificar se ja esta inscrito
    const existingEnrollment = await db.sessionParticipant.findUnique({
      where: {
        sessionId_userId: {
          sessionId: params.id,
          userId: session.user.id,
        }
      }
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { success: false, message: "Você já está inscrito nesta sessão" } as ApiResponse,
        { status: 409 }
      )
    }

    // Verificar se usuario e paciente
    const patientProfile = await db.patientProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!patientProfile) {
      return NextResponse.json(
        { success: false, message: "Apenas pacientes podem se inscrever em sessões" } as ApiResponse,
        { status: 403 }
      )
    }

    // Criar SessionParticipant
    const participant = await db.sessionParticipant.create({
      data: {
        sessionId: params.id,
        userId: session.user.id,
        status: "REGISTERED",
      },
      include: {
        session: {
          select: {
            title: true,
            scheduledAt: true,
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: participant,
      message: "Inscrição realizada com sucesso",
    } as ApiResponse)
  } catch (error) {
    console.error("Erro ao se inscrever na sessão:", error)
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    )
  }
}

