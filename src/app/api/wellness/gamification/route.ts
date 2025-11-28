import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { GamificationService } from "@/lib/gamification"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    // Get patient profile
    const { prisma } = await import("@/lib/db")
    const patient = await prisma.patientProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!patient) {
      return NextResponse.json(
        { error: "Perfil do paciente não encontrado" },
        { status: 404 }
      )
    }

    // Get gamification stats
    const stats = await GamificationService.getPatientStats(patient.id)

    if (!stats) {
      return NextResponse.json(
        { error: "Estatísticas não encontradas" },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: stats })
  } catch (error) {
    console.error("Error fetching gamification stats:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
