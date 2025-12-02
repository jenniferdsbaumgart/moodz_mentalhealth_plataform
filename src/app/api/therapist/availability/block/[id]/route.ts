import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db as prisma } from "@/lib/db"

// DELETE - Desbloquear uma data específica
export async function DELETE(
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

    // Importar mock storage (em produção seria do banco)
    const { mockBlockedDates } = require("../route")

    // Encontrar e remover o bloqueio
    const blockIndex = mockBlockedDates.findIndex(
      (block: any) => block.id === id && block.therapistId === therapistProfile.id
    )

    if (blockIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Bloqueio não encontrado" },
        { status: 404 }
      )
    }

    // Remover o bloqueio
    mockBlockedDates.splice(blockIndex, 1)

    return NextResponse.json({
      success: true,
      message: "Data desbloqueada com sucesso",
    })
  } catch (error) {
    console.error("Erro ao desbloquear data:", error)
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

