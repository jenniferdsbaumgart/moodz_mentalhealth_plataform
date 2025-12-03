import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db as prisma } from "@/lib/db"
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== "THERAPIST") {
      return NextResponse.json(
        { success: false, message: "Acesso negado" },
        { status: 403 }
      )
    }
    const { id } = params
    // Buscar perfil do terapeuta
    const therapistProfile = await prisma.therapistProfile.findUnique({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    })
    if (!therapistProfile) {
      return NextResponse.json(
        { success: false, message: "Perfil de terapeuta não encontrado" },
        { status: 404 }
      )
    }
    // Verificar se o paciente participou de sessões do terapeuta
    const patientParticipation = await prisma.sessionParticipant.findFirst({
      where: {
        userId: id,
        session: {
          therapistId: therapistProfile.id,
        },
      },
    })
    if (!patientParticipation) {
      return NextResponse.json(
        { success: false, message: "Paciente não encontrado ou sem participação em suas sessões" },
        { status: 404 }
      )
    }
    // Buscar dados completos do paciente
    const patient = await prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        profile: true,
        patientProfile: {
          include: {
            moodEntries: {
              orderBy: {
                date: "desc",
              },
              take: 10,
            },
            journalEntries: {
              orderBy: {
                createdAt: "desc",
              },
              take: 5,
            },
          },
        },
      },
    })
    if (!patient) {
      return NextResponse.json(
        { success: false, message: "Paciente não encontrado" },
        { status: 404 }
      )
    }
    // Buscar estatísticas das sessões
    const sessionStats = await prisma.sessionParticipant.groupBy({
      by: ["userId"],
      where: {
        userId: id,
        session: {
          therapistId: therapistProfile.id,
        },
      },
      _count: {
        sessionId: true,
      },
    })
    const totalSessions = sessionStats[0]?._count.sessionId || 0
    // Buscar sessões concluídas
    const completedSessions = await prisma.sessionParticipant.count({
      where: {
        userId: id,
        session: {
          therapistId: therapistProfile.id,
          status: "COMPLETED",
        },
      },
    })
    // Buscar última sessão
    const lastSession = await prisma.sessionParticipant.findFirst({
      where: {
        userId: id,
        session: {
          therapistId: therapistProfile.id,
        },
      },
      include: {
        session: true,
      },
      orderBy: {
        session: {
          scheduledAt: "desc",
        },
      },
    })
    // Calcular dias desde última sessão
    const daysSinceLastSession = lastSession
      ? Math.floor((new Date().getTime() - new Date(lastSession.session.scheduledAt).getTime()) / (1000 * 60 * 60 * 24))
      : null
    // Formatar dados do paciente
    const patientData = {
      id: patient.id,
      name: patient.name,
      email: patient.email,
      image: patient.image,
      phone: patient.profile?.phone || null,
      birthDate: patient.profile?.birthDate || null,
      bio: patient.profile?.bio || null,
      // Estatísticas
      totalSessions,
      completedSessions,
      avgRating: 0, // TODO: implementar sistema de avaliações
      daysSinceLastSession,
      lastSessionDate: lastSession?.session.scheduledAt || null,
      // Preferências
      preferredCategories: patient.patientProfile?.preferredCategories || [],
      emailNotifications: patient.patientProfile?.preferences?.emailNotifications ?? true,
      sessionReminders: patient.patientProfile?.preferences?.sessionReminders ?? true,
      // Status
      isActive: daysSinceLastSession !== null && daysSinceLastSession <= 30,
    }
    return NextResponse.json({
      success: true,
      data: patientData,
    })
  } catch (error) {
    console.error("Erro ao buscar detalhes do paciente:", error)
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
