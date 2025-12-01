import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db as prisma } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

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
    const hasAccess = await prisma.sessionParticipant.findFirst({
      where: {
        userId: id,
        session: {
          therapistId: therapistProfile.id,
        },
      },
    })

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, message: "Acesso negado a sessões deste paciente" },
        { status: 403 }
      )
    }

    // Buscar todas as sessões do paciente com este terapeuta
    const sessions = await prisma.sessionParticipant.findMany({
      where: {
        userId: id,
        session: {
          therapistId: therapistProfile.id,
        },
      },
      include: {
        session: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            _count: {
              select: {
                participants: true,
              },
            },
          },
        },
      },
      orderBy: {
        session: {
          scheduledAt: "desc",
        },
      },
    })

    // Formatar dados das sessões
    const formattedSessions = sessions.map((participation) => {
      const session = participation.session

      return {
        id: session.id,
        title: session.title,
        description: session.description,
        scheduledAt: session.scheduledAt,
        duration: session.duration,
        status: session.status,
        category: session.category,
        therapist: {
          name: session.therapist.name || "Terapeuta",
          image: session.therapist.image,
        },
        participants: session.participants.map(p => ({
          id: p.user.id,
          name: p.user.name,
          joinedAt: p.joinedAt,
          leftAt: p.leftAt,
        })),
        _count: session._count,
      }
    })

    return NextResponse.json({
      success: true,
      data: formattedSessions,
    })
  } catch (error) {
    console.error("Erro ao buscar sessões do paciente:", error)
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
