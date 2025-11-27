import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { userProfileSchema, updateUserProfileSchema } from "@/lib/validations/user"
import { ApiResponse, UserWithProfile } from "@/types/user"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Não autorizado" } as ApiResponse,
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
        therapistProfile: true,
        patientProfile: true,
        preferences: true,
        emergencyContacts: true,
        goals: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        moodLogs: {
          orderBy: { createdAt: "desc" },
          take: 30,
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Usuário não encontrado" } as ApiResponse,
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user,
    } as ApiResponse<UserWithProfile>)
  } catch (error) {
    console.error("Erro ao buscar perfil:", error)
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Não autorizado" } as ApiResponse,
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate input
    const validationResult = userProfileSchema.safeParse(body)
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

    // Check if profile already exists
    const existingProfile = await db.userProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (existingProfile) {
      return NextResponse.json(
        { success: false, message: "Perfil já existe" } as ApiResponse,
        { status: 409 }
      )
    }

    // Create profile
    const profile = await db.userProfile.create({
      data: {
        userId: session.user.id,
        ...validationResult.data,
      },
    })

    // Update user name if provided
    if (validationResult.data.name) {
      await db.user.update({
        where: { id: session.user.id },
        data: { name: validationResult.data.name },
      })
    }

    return NextResponse.json({
      success: true,
      data: profile,
      message: "Perfil criado com sucesso",
    } as ApiResponse)
  } catch (error) {
    console.error("Erro ao criar perfil:", error)
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Não autorizado" } as ApiResponse,
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate input
    const validationResult = updateUserProfileSchema.safeParse(body)
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

    // Update or create profile
    const profile = await db.userProfile.upsert({
      where: { userId: session.user.id },
      update: validationResult.data,
      create: {
        userId: session.user.id,
        ...validationResult.data,
      },
    })

    // Update user name if provided
    if (validationResult.data.name) {
      await db.user.update({
        where: { id: session.user.id },
        data: { name: validationResult.data.name },
      })
    }

    return NextResponse.json({
      success: true,
      data: profile,
      message: "Perfil atualizado com sucesso",
    } as ApiResponse)
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error)
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    )
  }
}
