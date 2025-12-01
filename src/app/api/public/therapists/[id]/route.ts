import { NextRequest, NextResponse } from "next/server"
import { db as prisma } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Buscar terapeuta com perfil, estatísticas, reviews e próximas sessões
    const therapist = await prisma.user.findUnique({
      where: {
        id,
        role: "THERAPIST",
        status: "ACTIVE",
        therapistProfile: {
          isVerified: true,
          availableForNew: true,
        },
      },
      include: {
        therapistProfile: {
          include: {
            stats: true,
            reviews: {
              include: {
                patient: {
                  select: {
                    name: true,
                  },
                },
                session: {
                  select: {
                    title: true,
                    scheduledAt: true,
                  },
                },
              },
              orderBy: {
                createdAt: "desc",
              },
              take: 5, // Últimas 5 reviews
            },
            availabilities: {
              where: {
                isRecurring: true,
              },
              orderBy: {
                dayOfWeek: "asc",
              },
            },
            groupSessions: {
              where: {
                status: "SCHEDULED",
                scheduledAt: {
                  gte: new Date(),
                },
              },
              orderBy: {
                scheduledAt: "asc",
              },
              take: 3, // Próximas 3 sessões
              select: {
                id: true,
                title: true,
                description: true,
                scheduledAt: true,
                duration: true,
                maxParticipants: true,
                _count: {
                  select: {
                    participants: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!therapist || !therapist.therapistProfile) {
      return NextResponse.json(
        {
          success: false,
          message: "Terapeuta não encontrado ou não disponível",
        },
        { status: 404 }
      )
    }

    // Formatar dados para resposta
    const profile = therapist.therapistProfile
    const publicData = {
      id: therapist.id,
      name: therapist.name,
      image: therapist.image,
      therapistProfile: {
        id: profile.id,
        crp: profile.crp,
        specialties: profile.specialties,
        specializations: profile.specializations || [],
        languages: profile.languages || [],
        bio: profile.bio,
        publicBio: profile.publicBio || profile.bio,
        education: profile.education,
        experience: profile.experience,
        photoUrl: profile.photoUrl,
        isVerified: profile.isVerified,
        hourlyRate: profile.hourlyRate,
        sessionPrice: profile.sessionPrice,
        currency: profile.currency || "BRL",
        availableForNew: profile.availableForNew,
        stats: profile.stats ? {
          totalSessions: profile.stats.totalSessions,
          totalPatients: profile.stats.totalPatients,
          avgRating: profile.stats.avgRating,
        } : null,
        reviews: profile.reviews.map(review => ({
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          isAnonymous: review.isAnonymous,
          createdAt: review.createdAt,
          patientName: review.isAnonymous ? null : review.patient.name,
          sessionTitle: review.session.title,
        })),
        availabilities: profile.availabilities,
        upcomingSessions: profile.groupSessions,
      },
    }

    return NextResponse.json({
      success: true,
      data: publicData,
    })
  } catch (error) {
    console.error("Erro ao buscar terapeuta público:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erro interno do servidor",
      },
      { status: 500 }
    )
  }
}
