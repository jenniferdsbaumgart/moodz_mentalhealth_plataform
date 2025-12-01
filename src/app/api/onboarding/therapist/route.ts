import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { therapistOnboardingSchema } from "@/lib/validations/onboarding"
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
    const validationResult = therapistOnboardingSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Dados inválidos",
          error: validationResult.error.issues,
        } as ApiResponse,
        { status: 400 }
      )
    }

    const { crp, specialties, bio, education, experience, documentUrl } = validationResult.data

    // Check if CRP already exists
    const existingTherapist = await db.therapistProfile.findUnique({
      where: { crp },
    })

    if (existingTherapist) {
      return NextResponse.json(
        { success: false, message: "CRP já cadastrado na plataforma" } as ApiResponse,
        { status: 409 }
      )
    }

    // Create therapist profile
    const therapistProfile = await db.therapistProfile.create({
      data: {
        userId: session.user.id,
        crp,
        specialties,
        bio,
        education,
        experience,
        documentUrl,
        isVerified: false, // Will be verified by admin
      },
    })

    return NextResponse.json({
      success: true,
      data: therapistProfile,
      message: "Cadastro enviado para aprovação",
    } as ApiResponse)
  } catch (error) {
    console.error("Erro no onboarding do terapeuta:", error)
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    )
  }
}


