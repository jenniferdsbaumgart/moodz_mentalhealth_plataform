import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { ApiResponse } from "@/types/user"

interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Não autorizado" } as ApiResponse,
        { status: 401 }
      )
    }

    // Check if user is enrolled in this session
    const enrollment = await db.sessionParticipant.findUnique({
      where: {
        sessionId_userId: {
          sessionId: params.id,
          userId: session.user.id,
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        enrolled: !!enrollment,
        status: enrollment?.status,
      },
    } as ApiResponse)
  } catch (error) {
    console.error("Erro ao verificar inscrição:", error)
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Não autorizado" } as ApiResponse,
        { status: 401 }
      )
    }

    // Check if session exists and is enrollable
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

    if (sessionData._count.participants >= sessionData.maxParticipants) {
      return NextResponse.json(
        { success: false, message: "Sessão está lotada" } as ApiResponse,
        { status: 400 }
      )
    }

    // Check if user is already enrolled
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

    // Check if user is a patient
    const patientProfile = await db.patientProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!patientProfile) {
      return NextResponse.json(
        { success: false, message: "Apenas pacientes podem se inscrever em sessões" } as ApiResponse,
        { status: 403 }
      )
    }

    // Create enrollment
    await db.sessionParticipant.create({
      data: {
        sessionId: params.id,
        userId: session.user.id,
        status: "REGISTERED",
      }
    })

    return NextResponse.json({
      success: true,
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

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Não autorizado" } as ApiResponse,
        { status: 401 }
      )
    }

    // Check if enrollment exists
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

    // Check if session allows cancellation
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

    // Check if session starts in less than 24 hours
    const sessionStart = new Date(sessionData.scheduledAt)
    const now = new Date()
    const hoursUntilStart = (sessionStart.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntilStart < 24) {
      return NextResponse.json(
        { success: false, message: "Não é possível cancelar com menos de 24 horas de antecedência" } as ApiResponse,
        { status: 400 }
      )
    }

    // Delete enrollment
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
