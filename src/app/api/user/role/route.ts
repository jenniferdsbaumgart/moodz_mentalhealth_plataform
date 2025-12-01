import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Role } from "@prisma/client"
import { ApiResponse } from "@/types/user"

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Não autorizado" } as ApiResponse,
        { status: 401 }
      )
    }

    const { role } = await request.json()

    if (!role || !Object.values(Role).includes(role)) {
      return NextResponse.json(
        { success: false, message: "Role inválido" } as ApiResponse,
        { status: 400 }
      )
    }

    // Update user role
    const user = await db.user.update({
      where: { id: session.user.id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: user,
      message: "Role atualizado com sucesso",
    } as ApiResponse)
  } catch (error) {
    console.error("Erro ao atualizar role:", error)
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    )
  }
}


