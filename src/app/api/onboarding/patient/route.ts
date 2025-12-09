import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { patientOnboardingSchema } from "@/lib/validations/onboarding"
import { ApiResponse } from "@/types/user"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Não autorizado" } as ApiResponse,
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate input
    const validationResult = patientOnboardingSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Dados inválidos",
          error: validationResult.error.issues.map(i => i.message).join(", "),
        } as ApiResponse,
        { status: 400 }
      )
    }

    const { bio, phone, birthDate, preferredCategories } = validationResult.data

    // Create patient profile
    const patientProfile = await db.patientProfile.create({
      data: {
        userId: session.user.id,
        preferredCategories: preferredCategories || [],
      },
    })

    // Update user profile if additional data provided
    if (bio || phone || birthDate) {
      await db.userProfile.upsert({
        where: { userId: session.user.id },
        update: {
          bio,
          phone,
          birthDate: birthDate ? new Date(birthDate) : undefined,
        },
        create: {
          userId: session.user.id,
          bio,
          phone,
          birthDate: birthDate ? new Date(birthDate) : undefined,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: patientProfile,
      message: "Onboarding completado com sucesso",
    } as ApiResponse)
  } catch (error) {
    console.error("Erro no onboarding do paciente:", error)
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    )
  }
}



