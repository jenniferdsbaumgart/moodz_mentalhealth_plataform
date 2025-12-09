import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db as prisma } from "@/lib/db"
// DELETE - Remover slot de disponibilidade
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== "THERAPIST") {
      return NextResponse.json(
        { success: false, message: "Acesso negado" },
        { status: 403 }
      )
    }
    const { id } = await params
    // Verificar se o slot existe e pertence ao terapeuta
    const availabilitySlot = await prisma.therapistAvailability.findFirst({
      where: {
        id,
        therapist: {
          userId: session.user.id,
        },
      },
    })
    if (!availabilitySlot) {
      return NextResponse.json(
        { success: false, message: "Slot não encontrado" },
        { status: 404 }
      )
    }
    // Deletar o slot
    await prisma.therapistAvailability.delete({
      where: {
        id,
      },
    })
    return NextResponse.json({
      success: true,
      message: "Horário removido com sucesso",
    })
  } catch (error) {
    console.error("Erro ao remover disponibilidade:", error)
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
