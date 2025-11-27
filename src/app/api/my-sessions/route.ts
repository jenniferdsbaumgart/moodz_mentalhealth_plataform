import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { ApiResponse } from "@/types/user"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Não autorizado" } as ApiResponse,
        { status: 401 }
      )
    }

    // Verificar se usuario e paciente
    const patientProfile = await db.patientProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!patientProfile) {
      return NextResponse.json(
        { success: false, message: "Acesso negado. Apenas pacientes têm sessões." } as ApiResponse,
        { status: 403 }
      )
    }

    // Buscar sessoes do usuario
    const userSessions = await db.sessionParticipant.findMany({
      where: { userId: session.user.id },
      include: {
        session: {
          include: {
            therapist: {
              include: {
                user: {
                  select: {
                    name: true,
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        session: {
          scheduledAt: "desc"
        }
      }
    })

    // Formatar resposta
    const sessions = userSessions.map(participant => ({
      ...participant.session,
      participants: [participant], // Include participant status
    }))

    return NextResponse.json({
      success: true,
      data: sessions,
    } as ApiResponse)
  } catch (error) {
    console.error("Erro ao buscar minhas sessões:", error)
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    )
  }
}
