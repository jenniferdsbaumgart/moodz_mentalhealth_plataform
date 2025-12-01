import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { ApiResponse } from "@/types/user"

export async function GET(request: NextRequest) {
  try {
    const sessions = await db.groupSession.findMany({
      where: {
        OR: [
          { status: "SCHEDULED" },
          { status: "LIVE" }
        ]
      },
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
      orderBy: { scheduledAt: "asc" },
    })

    return NextResponse.json({
      success: true,
      data: sessions,
    } as ApiResponse)
  } catch (error) {
    console.error("Erro ao buscar sessões públicas:", error)
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    )
  }
}


