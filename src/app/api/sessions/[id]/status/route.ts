import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { deleteDailyRoom } from "@/lib/daily"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const { id } = params
    const { status } = await request.json()

    // Validate status
    const validStatuses = ["LIVE", "COMPLETED", "CANCELLED"] as const
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Status inválido" },
        { status: 400 }
      )
    }

    // Get session and verify ownership
    const groupSession = await prisma.groupSession.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: true
          }
        }
      }
    })

    if (!groupSession) {
      return NextResponse.json(
        { error: "Sessão não encontrada" },
        { status: 404 }
      )
    }

    if (groupSession.therapistId !== session.user.id) {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      )
    }

    // Validate status transitions
    if (status === "LIVE" && groupSession.status !== "SCHEDULED") {
      return NextResponse.json(
        { error: "Apenas sessões agendadas podem ser iniciadas" },
        { status: 400 }
      )
    }

    if (status === "COMPLETED" && groupSession.status !== "LIVE") {
      return NextResponse.json(
        { error: "Apenas sessões ao vivo podem ser concluídas" },
        { status: 400 }
      )
    }

    if (status === "CANCELLED" && !["SCHEDULED", "LIVE"].includes(groupSession.status)) {
      return NextResponse.json(
        { error: "Esta sessão não pode ser cancelada" },
        { status: 400 }
      )
    }

    // Handle status changes
    const updateData: { status: string; roomName?: null; roomUrl?: null } = { status }

    if (status === "CANCELLED") {
      // Delete Daily.co room if exists
      if (groupSession.roomName) {
        try {
          await deleteDailyRoom(groupSession.roomName)
        } catch (error) {
          console.error("Error deleting Daily room:", error)
          // Continue with cancellation even if room deletion fails
        }
        updateData.roomName = null
        updateData.roomUrl = null
      }

      // Update all participants to CANCELLED status
      await prisma.sessionParticipant.updateMany({
        where: { sessionId: id },
        data: { status: "CANCELLED" }
      })

      // TODO: Send notification to all participants about cancellation
      // This could be implemented with email notifications or in-app notifications

    } else if (status === "COMPLETED") {
      // Mark participants who were confirmed as ATTENDED
      await prisma.sessionParticipant.updateMany({
        where: {
          sessionId: id,
          status: "CONFIRMED"
        },
        data: { status: "ATTENDED" }
      })

      // Mark participants who were registered but didn't join as NO_SHOW
      await prisma.sessionParticipant.updateMany({
        where: {
          sessionId: id,
          status: "REGISTERED"
        },
        data: { status: "NO_SHOW" }
      })
    }

    // Update session status
    const updatedSession = await prisma.groupSession.update({
      where: { id },
      data: updateData,
      include: {
        participants: {
          include: {
            user: true
          }
        }
      }
    })

    return NextResponse.json({
      data: updatedSession,
      message: `Sessão ${status === "CANCELLED" ? "cancelada" : status === "LIVE" ? "iniciada" : "concluída"} com sucesso`
    })

  } catch (error) {
    console.error("Error updating session status:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
