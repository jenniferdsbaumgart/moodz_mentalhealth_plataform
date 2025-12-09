import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { createSessionSchema } from "@/lib/validations/session"
import { ApiResponse } from "@/types/user"
import { notifySessionCreated } from "@/lib/notifications/triggers"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Não autorizado" } as ApiResponse,
        { status: 401 }
      )
    }

    // Get therapist profile to check if user is a therapist
    const therapistProfile = await db.therapistProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!therapistProfile) {
      return NextResponse.json(
        { success: false, message: "Acesso negado. Apenas terapeutas podem gerenciar sessões." } as ApiResponse,
        { status: 403 }
      )
    }

    const sessions = await db.groupSession.findMany({
      where: { therapistId: therapistProfile.id },
      include: {
        _count: {
          select: { participants: true }
        }
      },
      orderBy: { scheduledAt: "desc" },
    })

    return NextResponse.json({
      success: true,
      data: sessions,
    } as ApiResponse)
  } catch (error) {
    console.error("Erro ao buscar sessões:", error)
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionAuth = await auth()

    if (!sessionAuth?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Não autorizado" } as ApiResponse,
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate input
    const validationResult = createSessionSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Dados inválidos",
          error: validationResult.error.issues.map(i => i.message).join(", "),
        } as ApiResponse,
        { status: 400 }
      )
    }

    // Get therapist profile
    const therapistProfile = await db.therapistProfile.findUnique({
      where: { userId: sessionAuth.user.id },
    })

    if (!therapistProfile) {
      return NextResponse.json(
        { success: false, message: "Acesso negado. Apenas terapeutas podem criar sessões." } as ApiResponse,
        { status: 403 }
      )
    }

    // Check if therapist is verified
    if (!therapistProfile.isVerified) {
      return NextResponse.json(
        { success: false, message: "Seu perfil de terapeuta ainda não foi verificado." } as ApiResponse,
        { status: 403 }
      )
    }

    const sessionData = {
      ...validationResult.data,
      therapistId: therapistProfile.id,
      scheduledAt: new Date(validationResult.data.scheduledAt),
    }

    const newSession = await db.groupSession.create({
      data: sessionData,
      include: {
        _count: {
          select: { participants: true }
        }
      },
    })

    // Send notification about session creation (non-blocking)
    notifySessionCreated(newSession.id).catch(console.error)

    return NextResponse.json({
      success: true,
      data: newSession,
      message: "Sessão criada com sucesso",
    } as ApiResponse)
  } catch (error) {
    console.error("Erro ao criar sessão:", error)
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    )
  }
}



