import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { GamificationService } from "@/lib/gamification"

interface RouteParams {
  params: {
    id: string
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await request.json()
    const { duration, rating, notes } = body

    // Get patient profile
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

    // Verify exercise exists
    const exercise = await prisma.mindfulnessExercise.findUnique({
      where: { id },
    })

    if (!exercise) {
      return NextResponse.json(
        { error: "Exercício não encontrado" },
        { status: 404 }
      )
    }

    // Create completion record
    const completion = await prisma.exerciseCompletion.create({
      data: {
        patientId: patient.id,
        exerciseId: id,
        duration: duration || exercise.duration,
        rating: rating ? parseInt(rating) : null,
        notes: notes || null,
      },
    })

    // Award points and check badges using gamification service
    const gamificationResult = await GamificationService.awardExerciseCompletionPoints(patient.id, exercise.category)

    return NextResponse.json({
      data: completion,
      message: "Exercício concluído com sucesso!",
      gamification: gamificationResult,
    })
  } catch (error) {
    console.error("Error completing exercise:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
