import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { updateSessionSchema } from "@/lib/validations/session"
import { ApiResponse } from "@/types/user"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Não autorizado" } as ApiResponse,
        { status: 401 }
      )
    }

    const { id } = await params

    const sessionData = await db.groupSession.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              }
            }
          }
        },
        _count: {
          select: { participants: true }
        }
      },
    })

    if (!sessionData) {
      return NextResponse.json(
        { success: false, message: "Sessão não encontrada" } as ApiResponse,
        { status: 404 }
      )
    }

    // Check if user is the therapist or an admin
    const therapistProfile = await db.therapistProfile.findUnique({
      where: { userId: session.user.id },
    })

    const isTherapist = therapistProfile?.id === sessionData.therapistId
    const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN"

    if (!isTherapist && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "Acesso negado" } as ApiResponse,
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: sessionData,
    } as ApiResponse)
  } catch (error) {
    console.error("Erro ao buscar sessão:", error)
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Não autorizado" } as ApiResponse,
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    // Validate input
    const validationResult = updateSessionSchema.safeParse(body)
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

    // Get the session to check ownership
    const existingSession = await db.groupSession.findUnique({
      where: { id },
    })

    if (!existingSession) {
      return NextResponse.json(
        { success: false, message: "Sessão não encontrada" } as ApiResponse,
        { status: 404 }
      )
    }

    // Check if user is the therapist or an admin
    const therapistProfile = await db.therapistProfile.findUnique({
      where: { userId: session.user.id },
    })

    const isTherapist = therapistProfile?.id === existingSession.therapistId
    const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN"

    if (!isTherapist && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "Acesso negado" } as ApiResponse,
        { status: 403 }
      )
    }

    // Prepare update data
    const updateData: any = { ...validationResult.data }

    if (validationResult.data.scheduledAt) {
      updateData.scheduledAt = new Date(validationResult.data.scheduledAt)
    }

    const updatedSession = await db.groupSession.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { participants: true }
        }
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedSession,
      message: "Sessão atualizada com sucesso",
    } as ApiResponse)
  } catch (error) {
    console.error("Erro ao atualizar sessão:", error)
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Não autorizado" } as ApiResponse,
        { status: 401 }
      )
    }

    const { id } = await params

    // Get the session to check ownership
    const existingSession = await db.groupSession.findUnique({
      where: { id },
    })

    if (!existingSession) {
      return NextResponse.json(
        { success: false, message: "Sessão não encontrada" } as ApiResponse,
        { status: 404 }
      )
    }

    // Check if user is the therapist or an admin
    const therapistProfile = await db.therapistProfile.findUnique({
      where: { userId: session.user.id },
    })

    const isTherapist = therapistProfile?.id === existingSession.therapistId
    const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN"

    if (!isTherapist && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "Acesso negado" } as ApiResponse,
        { status: 403 }
      )
    }

    // Only allow deletion of scheduled sessions
    if (existingSession.status !== "SCHEDULED") {
      return NextResponse.json(
        { success: false, message: "Não é possível excluir sessões que já começaram" } as ApiResponse,
        { status: 400 }
      )
    }

    await db.groupSession.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "Sessão excluída com sucesso",
    } as ApiResponse)
  } catch (error) {
    console.error("Erro ao excluir sessão:", error)
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    )
  }
}



