import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { ApiResponse } from "@/types/user"

interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await db.groupSession.findUnique({
      where: { id: params.id },
      include: {
        therapist: {
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

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Sessão não encontrada" } as ApiResponse,
        { status: 404 }
      )
    }

    // Only show scheduled or live sessions publicly
    if (session.status !== "SCHEDULED" && session.status !== "LIVE") {
      return NextResponse.json(
        { success: false, message: "Sessão não disponível" } as ApiResponse,
        { status: 404 }
      )
    }

    // Get therapist profile info
    const therapistProfile = await db.therapistProfile.findUnique({
      where: { id: session.therapistId },
      select: {
        bio: true,
        specialties: true,
      }
    })

    const sessionWithTherapist = {
      ...session,
      therapist: {
        ...session.therapist,
        ...therapistProfile,
      }
    }

    return NextResponse.json({
      success: true,
      data: sessionWithTherapist,
    } as ApiResponse)
  } catch (error) {
    console.error("Erro ao buscar sessão pública:", error)
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    )
  }
}

